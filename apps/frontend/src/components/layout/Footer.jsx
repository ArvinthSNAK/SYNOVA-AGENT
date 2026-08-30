import Logo from "../common/Logo";
import "./Footer.css";

const COLUMNS = [
  {
    heading: "Product",
    links: ["AI form filling", "Document extraction", "Quote comparison", "Voice agent"],
  },
  {
    heading: "Company",
    links: ["About", "Careers", "Contact"],
  },
  {
    heading: "Resources",
    links: ["Docs", "Support", "Security"],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Logo />
            <p className="footer-blurb">
              The AI copilot insurance agents use to quote, compare, and close new
              business and renewals across every insurer, in one place.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <div className="footer-heading">{col.heading}</div>
              <div className="footer-links">
                {col.links.map((link) => (
                  <a key={link} href="#">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Synova. All rights reserved.</span>
          <span>Built for insurance agents, by agents.</span>
        </div>
      </div>
    </footer>
  );
}
