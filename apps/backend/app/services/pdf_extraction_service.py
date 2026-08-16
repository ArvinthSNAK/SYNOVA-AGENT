import pymupdf
import easyocr

# EasyOCR reader is expensive to initialize (loads model weights),
# so we create it once and reuse it across requests.
_ocr_reader = None


def _get_ocr_reader():
    global _ocr_reader
    if _ocr_reader is None:
        _ocr_reader = easyocr.Reader(["en"], gpu=False)
    return _ocr_reader


class PdfExtractionError(ValueError):
    pass


def extract_text_from_pdf(file_path: str, min_chars_per_page: int = 20) -> str:
    """
    Extracts text from a PDF, page by page.
    - Tries direct text extraction first (fast, exact).
    - Falls back to OCR only for pages with little/no extractable text
      (i.e. scanned/image-based pages).
    """
    try:
        doc = pymupdf.open(file_path)
    except Exception as e:
        raise PdfExtractionError(f"Could not open PDF: {e}") from e

    if doc.page_count == 0:
        raise PdfExtractionError("PDF has no pages")

    all_text_parts = []
    reader = None

    for page_index in range(doc.page_count):
        page = doc.load_page(page_index)
        page_text = page.get_text().strip()

        if len(page_text) >= min_chars_per_page:
            all_text_parts.append(page_text)
            continue

        # Fallback: render page to an image and OCR it
        if reader is None:
            reader = _get_ocr_reader()

        pix = page.get_pixmap(dpi=300)
        img_bytes = pix.tobytes("png")

        ocr_results = reader.readtext(img_bytes, detail=0)
        ocr_text = "\n".join(ocr_results)
        all_text_parts.append(ocr_text)

    doc.close()

    full_text = "\n\n".join(all_text_parts).strip()
    if not full_text:
        raise PdfExtractionError("No text could be extracted from this PDF, even with OCR")

    return full_text