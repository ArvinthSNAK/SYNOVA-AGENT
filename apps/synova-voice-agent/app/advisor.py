import re
import urllib.parse
from app.models import AdvisorSession, Intent, TurnResponse

WORKFLOWS: dict[str, list[tuple[str, str]]] = {
    "NEW_MOTOR_INSURANCE": [
        ("vehicle_registration", "What is your vehicle registration number? (e.g. KA-01-MJ-4092)"),
        ("vehicle_make", "What is your vehicle make or manufacturer? (e.g. Hyundai, Tata, Maruti, Honda, Kia)"),
        ("vehicle_model", "What is the vehicle model and variant? (e.g. Creta SX, Nexon, City, Seltos)"),
        ("vehicle_age_years", "What is your vehicle age in years or registration year? (e.g. 2 years or 2023)"),
        ("idv", "What is your desired IDV (Insured Declared Value)? (e.g. ₹6,50,000)"),
        ("ncb_percent", "What is your existing No Claim Bonus (NCB) discount? (e.g. 20%, 35%, 50%, or 0%)")
    ],
    "RENEWAL_MOTOR_INSURANCE": [
        ("vehicle_registration", "What is your vehicle registration number? (e.g. KA-01-MJ-4092)"),
        ("previous_insurer", "Who is your current or previous insurer? (e.g. ICICI Lombard, ACKO, TATA AIG, HDFC ERGO)"),
        ("policy_number", "What is your existing policy number? (e.g. POL-SYN-88219 or say skip)"),
        ("vehicle_make", "What is the vehicle make? (e.g. Hyundai, Tata, Maruti, Honda)"),
        ("vehicle_model", "What is the vehicle model? (e.g. Creta SX, Seltos, Nexon)"),
        ("ncb_percent", "What was your previous No Claim Bonus (NCB) percentage? (e.g. 20% or 50%)"),
        ("idv", "What is your current policy IDV or insured value? (e.g. ₹6,50,000)")
    ],
    "HEALTH_INSURANCE": [
        ("target_person", "Is this cover for yourself, your family, or your parents?"),
        ("age", "What are the ages of the people you want to cover? (e.g. 32 years)"),
        ("city", "Which city do they live in? (e.g. Bengaluru, Mumbai)"),
        ("medical_conditions", "Do they have any pre-existing medical conditions? (Say 'None' if healthy)"),
        ("coverage_amount", "What level of health cover would feel comfortable for you? (e.g. ₹10 Lakhs)")
    ],
    "LIFE_INSURANCE": [
        ("age", "What is your age in years? (e.g. 30)"),
        ("occupation", "What do you do for work?"),
        ("income", "What is your approximate annual income? (e.g. ₹12 Lakhs)"),
        ("dependents", "How many people rely on your income?"),
        ("financial_goals", "What would you most like this policy to protect: family income, a loan, or long-term goals?")
    ],
    "CLAIM": [
        ("incident_type", "I am sorry that happened. What happened, and when did it occur?"),
        ("incident_location", "Where did the incident occur? (e.g. Indiranagar, Bengaluru)"),
        ("photos", "Please upload any photos or supporting documents you have.")
    ]
}

def strip_asterisks(text: str) -> str:
    if not text:
        return ""
    return text.replace('*', '').strip()

def validate_and_extract(field_name: str, raw_text: str) -> tuple[bool, str, str]:
    text = raw_text.strip()
    lower = text.lower()
    
    if field_name == "vehicle_registration":
        match = re.search(r'([A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4})', text, re.IGNORECASE)
        if match:
            clean = match.group(1).upper().replace(' ', '-')
            return True, clean, ""
        alt_match = re.search(r'\b([A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4})\b', re.sub(r'[-\s]', '', text.upper()))
        if alt_match:
            return True, alt_match.group(1), ""
        return False, "", "I didn't catch a valid vehicle registration number. Could you please provide your vehicle registration number? (e.g. KA-01-MJ-4092)"

    if field_name in ("vehicle_make", "make"):
        makes = ["Hyundai", "Tata", "Maruti Suzuki", "Maruti", "Honda", "Kia", "Toyota", "Mahindra", "Volkswagen", "Skoda", "MG", "BMW", "Audi", "Mercedes", "Renault", "Nissan", "Ford", "Suzuki", "Bajaj", "TVS", "Yamaha", "Royal Enfield", "Hero", "Ather", "Ola", "Jeep", "Volvo", "Porsche", "Land Rover", "Jaguar"]
        for m in makes:
            if m.lower() in lower:
                return True, m, ""
        stopwords = {"yes", "no", "ok", "okay", "maybe", "idk", "why", "who", "what", "where", "how", "hello", "hi", "hey", "car", "bike", "vehicle", "price", "quote", "cost", "policy", "insurance", "none", "nothing"}
        words = [w for w in re.findall(r'[a-zA-Z]+', lower) if w not in stopwords]
        if words and len(words) <= 2:
            return True, " ".join(words).title(), ""
        return False, "", "I didn't recognize that vehicle manufacturer. What is your vehicle's make? (e.g. Hyundai, Tata, Maruti, Honda, Kia)"

    if field_name in ("vehicle_model", "model"):
        models = ["Creta SX", "Creta", "Nexon EV", "Nexon", "Seltos", "Brezza", "Baleno", "City VX", "City", "Swift", "Harrier", "XUV700", "XUV300", "Sonet", "Verna", "Fortuner", "Innova", "Punch", "Dzire", "i20", "i10", "Amaze", "WagonR", "Altroz", "Tiago", "Venue", "Grand Vitara", "Scorpio", "Carens", "Kiger", "Magnite", "Slavia", "Kushaq", "Taigun", "Virtus", "Pulsar", "Splendor", "Activa", "Jupiter", "Classic 350", "Hunter 350"]
        for m in models:
            if m.lower() in lower:
                return True, m, ""
        stopwords = {"yes", "no", "ok", "okay", "idk", "why", "who", "what", "where", "how", "hello", "hi", "hey", "car", "bike", "price", "quote", "cost", "policy", "insurance", "none", "nothing", "buy", "renew"}
        words = [w for w in re.findall(r'[a-zA-Z0-9]+', lower) if w not in stopwords]
        if words and len(words) <= 3:
            return True, " ".join(words).title(), ""
        return False, "", "Could you please specify your vehicle model and variant? (e.g. Creta SX, Nexon EV, City VX, or Swift VXI)"

    if field_name in ("vehicle_age_years", "age"):
        if any(w in lower for w in ("new", "brand new", "0", "zero")):
            return True, "0", ""
        match = re.search(r'(\b\d{1,2}\b)\s*(?:years?|yrs?|yr)?', lower)
        if match:
            return True, match.group(1), ""
        year_match = re.search(r'\b(20[0-2]\d|19\d\d)\b', raw_text)
        if year_match:
            age = max(0, 2026 - int(year_match.group(1)))
            return True, str(age), ""
        return False, "", "Please provide the age in years (e.g. 2 years) or the registration year (e.g. 2023 or brand new)."

    if field_name in ("idv", "coverage_amount"):
        lakh_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakhs?|lac|l)\b', lower)
        if lakh_match:
            val = int(float(lakh_match.group(1)) * 100000)
            return True, str(val), ""
        k_match = re.search(r'(\d+(?:\.\d+)?)\s*k\b', lower)
        if k_match:
            val = int(float(k_match.group(1)) * 1000)
            return True, str(val), ""
        num_match = re.search(r'(\d{5,8})', re.sub(r'[,₹\s]', '', raw_text))
        if num_match:
            return True, num_match.group(1), ""
        small_num = re.search(r'\b(\d(?:\.\d+)?)\b', lower)
        if small_num and float(small_num.group(1)) <= 50:
            val = int(float(small_num.group(1)) * 100000)
            return True, str(val), ""
        return False, "", "Please provide your desired IDV (Insured Declared Value) in Rupees or Lakhs (e.g. ₹6,50,000 or 6.5 Lakhs)."

    if field_name in ("ncb_percent", "ncb"):
        if re.search(r'\b(zero|none|no claim|no discount)\b', lower) or lower.strip() in ("0%", "0"):
            return True, "0", ""
        ncb_match = re.search(r'(\d{1,2})\s*%', raw_text)
        if ncb_match:
            return True, ncb_match.group(1), ""
        plain_match = re.search(r'\b(0|20|25|35|45|50)\b', raw_text)
        if plain_match:
            return True, plain_match.group(1), ""
        return False, "", "What is your existing No Claim Bonus (NCB) discount percentage? (e.g. 0%, 20%, 35%, or 50%)"

    if field_name == "previous_insurer":
        if any(w in lower for w in ("skip", "dont know", "dont remember", "not sure", "none")):
            return True, "ICICI Lombard", ""
        insurers = ["ICICI Lombard", "ACKO", "TATA AIG", "HDFC ERGO", "Bajaj Allianz", "Digit", "Star Health", "SBI General", "New India", "United India", "Oriental", "National", "Reliance", "Care", "Niva Bupa", "Cholamandalam"]
        for ins in insurers:
            if ins.lower() in lower:
                return True, ins, ""
        words = [w for w in re.findall(r'[a-zA-Z]+', lower) if w not in {"insurance", "company", "my", "is", "the", "general"}]
        if words and len(words) <= 3:
            return True, " ".join(words).title(), ""
        return False, "", "Who is your current or previous insurer? (e.g. ICICI Lombard, ACKO, TATA AIG, HDFC ERGO, or say 'skip')"

    if field_name == "policy_number":
        if any(w in lower for w in ("skip", "dont know", "dont have", "no", "not handy", "not sure")):
            return True, "POL-SYN-88219", ""
        pol_match = re.search(r'([A-Z0-9/-]{5,25})', raw_text.upper())
        if pol_match and any(c.isdigit() for c in pol_match.group(1)):
            return True, pol_match.group(1), ""
        return False, "", "What is your existing policy number? (e.g. POL-SYN-88219 or say 'skip')"

    if field_name == "target_person":
        if any(w in lower for w in ("myself", "self", "me", "individual", "for me")):
            return True, "Self", ""
        if any(w in lower for w in ("family", "spouse", "wife", "husband", "children", "kids", "son", "daughter")):
            return True, "Family", ""
        if any(w in lower for w in ("parent", "father", "mother", "dad", "mom", "in-laws")):
            return True, "Parents", ""
        return False, "", "Is this health cover for yourself, your family, or your parents?"

    if field_name == "city":
        stopwords = {"yes", "no", "ok", "okay", "idk", "why", "who", "what", "where", "how", "hello", "hi", "hey", "policy", "insurance", "none", "nothing", "buy", "renew"}
        words = [w for w in re.findall(r'[a-zA-Z]+', lower) if w not in stopwords]
        if words and len(words) <= 2:
            return True, " ".join(words).title(), ""
        return False, "", "Which city do they currently live in? (e.g. Bengaluru, Mumbai, Delhi, Chennai)"

    if field_name == "medical_conditions":
        if any(w in lower for w in ("no", "none", "nil", "na", "healthy", "fit", "nothing", "dont have", "no disease")):
            return True, "None", ""
        if len(text) >= 2:
            return True, text, ""
        return False, "", "Do they have any pre-existing medical conditions like diabetes or BP? (Say 'None' if healthy)"

    if field_name == "incident_type":
        if len(text) >= 4 and not any(w in lower for w in ("hello", "hi", "what is this", "tell me")):
            return True, text, ""
        return False, "", "Could you please describe what happened during the incident and when it occurred?"

    if field_name == "incident_location":
        if len(text) >= 3 and not any(w in lower for w in ("hello", "hi", "why")):
            return True, text, ""
        return False, "", "Where did the incident occur? (e.g. Indiranagar, Bengaluru)"

    # Fallback for open-ended fields like photos, occupation, income, dependents, financial_goals
    if len(text) >= 1:
        return True, text, ""
    return False, "", f"Please provide your details for {field_name}."

def detect_intent(text: str) -> Intent:
    lower = text.lower()
    
    # Simple Greetings
    if lower in ("hi", "hello", "hey", "start", "good morning", "good evening", "namaste", "help"):
        return "UNKNOWN"
        
    question_phrases = ("what is", "what are", "what does", "how does", "how do", "why is", "explain", "meaning of", "tell me about")
    is_question = any(phrase in lower for phrase in question_phrases)
    if any(x in lower for x in ("deductible", "no claim bonus", " ncb", " idv", "third party", "comprehensive cover")) or (is_question and any(x in lower for x in ("insurance", "policy", "premium", "cover"))):
        return "POLICY_QUERY"
    if any(x in lower for x in ("renew", "renewal", "expiry", "expire")):
        return "RENEW_INSURANCE"
    if any(x in lower for x in ("accident", "claim", "damage", "crash", "fnol")):
        return "CLAIM_ASSISTANCE"
    if any(x in lower for x in ("compare", "comparison", "best quote", "cheapest")):
        return "POLICY_COMPARISON"
    if any(x in lower for x in ("health score", "insurance score")):
        return "INSURANCE_HEALTH_SCORE"
    if any(x in lower for x in ("buy", "new", "explore", "purchase", "get insurance", "motor", "car", "bike", "health", "medical", "life", "term")):
        return "NEW_INSURANCE"
    return "UNKNOWN"

def detect_workflow(text: str, intent: Intent) -> str | None:
    lower = text.lower()
    if intent == "RENEW_INSURANCE" or "renew" in lower:
        return "RENEWAL_MOTOR_INSURANCE"
    if intent == "CLAIM_ASSISTANCE":
        return "CLAIM"
    if "health" in lower or "medical" in lower:
        return "HEALTH_INSURANCE"
    if "life" in lower or "term" in lower:
        return "LIFE_INSURANCE"
    if "car" in lower or "motor" in lower or "bike" in lower or "vehicle" in lower or intent == "NEW_INSURANCE":
        return "NEW_MOTOR_INSURANCE"
    return None

def next_turn(session: AdvisorSession, transcript: str, customer_name: str | None = None) -> TurnResponse:
    account_name = customer_name or session.collected_data.get("customer_name") or "Valued Customer"
    session.collected_data["customer_name"] = account_name

    text = transcript.strip()
    lower = text.lower()
    
    # Check if user requests a restart or asks a new intent
    is_restart = any(w in lower for w in ("start over", "reset", "restart", "new chat", "clear", "start again", "new conversation"))
    detected_intent = detect_intent(text)

    # If previous session reached RECOMMEND, or restart requested, or user explicitly initiates a new workflow/intent:
    if session.stage == "RECOMMEND" or is_restart or (session.stage != "IDENTIFY_INTENT" and detected_intent in ("NEW_INSURANCE", "RENEW_INSURANCE", "CLAIM_ASSISTANCE", "POLICY_COMPARISON", "INSURANCE_HEALTH_SCORE")):
        session.stage = "IDENTIFY_INTENT"
        session.workflow = None
        session.intent = "UNKNOWN"
        session.collected_data = {"customer_name": account_name}

    # 1. Initial State or Intent Identification
    if session.stage == "IDENTIFY_INTENT":
        if lower in ("hi", "hello", "hey", "start", "good morning", "good evening", "namaste", "help"):
            return TurnResponse(
                reply=strip_asterisks(f"Hi {account_name}! How can I assist you today? Would you like to Buy New Insurance, Renew an existing policy, or get Claim Assistance?"),
                session=session,
                event="question"
            )
            
        session.intent = detect_intent(text)
        session.workflow = detect_workflow(text, session.intent)
        
        if session.intent == "POLICY_QUERY":
            ans = common_answer(text)
            return TurnResponse(reply=strip_asterisks(f"{ans}\n\nWould you like me to help you get a quote or renew your policy today?"), session=session, event="question")
            
        if session.intent == "UNKNOWN":
            return TurnResponse(
                reply=strip_asterisks(f"Hi {account_name}! How can I assist you today? Would you like to Buy New Insurance, Renew an existing policy, or get Claim Assistance?"),
                session=session,
                event="question"
            )
            
        if session.workflow is None:
            if session.intent == "NEW_INSURANCE":
                session.workflow = "NEW_MOTOR_INSURANCE"
            elif session.intent == "RENEW_INSURANCE":
                session.workflow = "RENEWAL_MOTOR_INSURANCE"
            else:
                session.stage = "IDENTIFY_INSURANCE_TYPE"
                return TurnResponse(reply="What type of insurance are you looking for — Motor, Health, or Term Life?", session=session, event="question")
                
        if session.workflow == "RENEWAL_MOTOR_INSURANCE":
            if "pdf" in lower and any(w in lower for w in ("have", "yes", "upload", "got", "with", "my")):
                session.stage = "RECOMMEND"
                return TurnResponse(
                    reply="Great! Navigating you straight to the policy renewal page to upload your PDF.",
                    session=session,
                    event="autofill_ready_renew",
                    target_url="/renew-insurance",
                    autofill_data={"customer_name": account_name}
                )
            session.stage = "ASK_RENEWAL_PDF"
            return TurnResponse(
                reply="Do you have your previous policy PDF handy?",
                session=session,
                event="ask_renewal_pdf"
            )

        # For NEW_MOTOR_INSURANCE or other workflows, reset data & begin collecting first field immediately
        session.collected_data = {"customer_name": account_name}
        fields = WORKFLOWS.get(session.workflow, WORKFLOWS["NEW_MOTOR_INSURANCE"])
        first_field_key, first_field_q = fields[0]
        session.stage = f"COLLECT_{first_field_key.upper()}"
        return TurnResponse(reply=strip_asterisks(first_field_q), session=session, event="question")
        
    elif session.stage == "IDENTIFY_INSURANCE_TYPE":
        session.workflow = detect_workflow(text, "NEW_INSURANCE")
        if not session.workflow:
            return TurnResponse(reply="Please specify whether you need Motor, Health, or Term Life insurance.", session=session, event="question")
        if session.workflow == "RENEWAL_MOTOR_INSURANCE":
            session.stage = "ASK_RENEWAL_PDF"
            return TurnResponse(
                reply="Do you have your previous policy PDF handy?",
                session=session,
                event="ask_renewal_pdf"
            )
        session.collected_data = {"customer_name": account_name}
        fields = WORKFLOWS.get(session.workflow, WORKFLOWS["NEW_MOTOR_INSURANCE"])
        first_field_key, first_field_q = fields[0]
        session.stage = f"COLLECT_{first_field_key.upper()}"
        return TurnResponse(reply=strip_asterisks(first_field_q), session=session, event="question")

    elif session.stage == "ASK_RENEWAL_PDF":
        is_yes = any(w in lower for w in ("yes", "yeah", "yep", "i have", "i do", "sure", "have pdf", "yup", "available", "got it", "i got", "upload", "pdf")) and not any(w in lower for w in ("no", "not", "dont", "don't", "without"))
        is_no = any(w in lower for w in ("no", "dont have", "don't have", "without", "manual", "not available", "nope", "dont", "don't", "nah", "enter details"))
        
        if is_yes:
            session.stage = "RECOMMEND"
            return TurnResponse(
                reply="Great! Navigating you straight to the policy renewal page to upload your PDF.",
                session=session,
                event="autofill_ready_renew",
                target_url="/renew-insurance",
                autofill_data={"customer_name": account_name}
            )
        elif is_no:
            session.collected_data = {"customer_name": account_name}
            fields = WORKFLOWS.get("RENEWAL_MOTOR_INSURANCE", WORKFLOWS["RENEWAL_MOTOR_INSURANCE"])
            first_field_key, first_field_q = fields[0]
            session.stage = f"COLLECT_{first_field_key.upper()}"
            question_text = f"No problem! {first_field_q}"
            return TurnResponse(reply=strip_asterisks(question_text), session=session, event="question")
        else:
            # Irrelevant answer to PDF question: Ask again
            return TurnResponse(
                reply="Please confirm if you have your previous policy PDF handy (say 'Yes' to upload or 'No' to enter vehicle details manually).",
                session=session,
                event="ask_renewal_pdf"
            )
        
    elif session.stage.startswith("COLLECT_") and session.workflow:
        current_field = session.stage.removeprefix("COLLECT_").lower()
        
        # Check if user asked a general knowledge question during flow
        if detect_intent(text) == "POLICY_QUERY":
            ans = common_answer(text)
            fields = WORKFLOWS.get(session.workflow, [])
            curr_q = next((q for k, q in fields if k == current_field), "Please provide your details.")
            return TurnResponse(reply=strip_asterisks(f"{ans}\n\nTo proceed: {curr_q}"), session=session, event="question")
        
        # Validate extracted value
        is_valid, extracted_val, error_msg = validate_and_extract(current_field, text)
        if not is_valid:
            # Re-ask the question when input is irrelevant
            return TurnResponse(reply=strip_asterisks(error_msg), session=session, event="question")
        
        # Store valid field
        session.collected_data[current_field] = extracted_val

    if not session.workflow:
        session.workflow = "NEW_MOTOR_INSURANCE"

    fields = WORKFLOWS.get(session.workflow, WORKFLOWS["NEW_MOTOR_INSURANCE"])
    required_keys = [k for k, _ in fields]
    missing_fields = [k for k in required_keys if k not in session.collected_data]
    
    if missing_fields:
        next_key = missing_fields[0]
        next_q = next(q for k, q in fields if k == next_key)
        session.stage = f"COLLECT_{next_key.upper()}"
        return TurnResponse(reply=strip_asterisks(f"Got it. {next_q}"), session=session, event="question")
        
    # ONLY when ALL fields are collected: Prepare Autofill Navigation
    session.stage = "RECOMMEND"
    
    if session.workflow == "NEW_MOTOR_INSURANCE":
        data = {
            "customer_name": session.collected_data.get("customer_name", account_name),
            "vehicle_registration": session.collected_data.get("vehicle_registration", ""),
            "vehicle_make": session.collected_data.get("vehicle_make", ""),
            "vehicle_model": session.collected_data.get("vehicle_model", ""),
            "vehicle_age_years": session.collected_data.get("vehicle_age_years", "0"),
            "idv": session.collected_data.get("idv", "0"),
            "ncb_percent": session.collected_data.get("ncb_percent", "0"),
            "autofill": "true"
        }
        query_str = urllib.parse.urlencode({
            "name": data["customer_name"],
            "reg": data["vehicle_registration"],
            "make": data["vehicle_make"],
            "model": data["vehicle_model"],
            "age": data["vehicle_age_years"],
            "idv": data["idv"],
            "ncb": data["ncb_percent"],
            "autofill": "true"
        })
        target_url = f"/new-insurance?{query_str}"
        idv_val = int(data['idv']) if data['idv'].isdigit() else 0
        summary_msg = f"Thank you, {account_name}! I have captured all your vehicle details:\n\n• Vehicle: {data['vehicle_make']} {data['vehicle_model']} ({data['vehicle_registration']})\n• Age: {data['vehicle_age_years']} yrs | IDV Cover: ₹{idv_val:,} | NCB: {data['ncb_percent']}%\n\nI am now taking you to the live quote comparison page with your form autofilled."
        
        return TurnResponse(
            reply=strip_asterisks(summary_msg),
            session=session,
            event="autofill_ready_new",
            autofill_data=data,
            target_url=target_url
        )

    elif session.workflow == "RENEWAL_MOTOR_INSURANCE":
        data = {
            "customer_name": session.collected_data.get("customer_name", account_name),
            "vehicle_registration": session.collected_data.get("vehicle_registration", ""),
            "previous_insurer": session.collected_data.get("previous_insurer", "ICICI Lombard"),
            "policy_number": session.collected_data.get("policy_number", "POL-SYN-88219"),
            "vehicle_make": session.collected_data.get("vehicle_make", ""),
            "vehicle_model": session.collected_data.get("vehicle_model", ""),
            "idv": session.collected_data.get("idv", "0"),
            "ncb_percent": session.collected_data.get("ncb_percent", "0"),
            "autofill": "true"
        }
        query_str = urllib.parse.urlencode({
            "name": data["customer_name"],
            "reg": data["vehicle_registration"],
            "policy": data["policy_number"],
            "insurer": data["previous_insurer"],
            "make": data["vehicle_make"],
            "model": data["vehicle_model"],
            "idv": data["idv"],
            "ncb": data["ncb_percent"],
            "autofill": "true"
        })
        target_url = f"/renew-insurance?{query_str}"
        idv_val = int(data['idv']) if data['idv'].isdigit() else 0
        summary_msg = f"Thank you, {account_name}! I have extracted your renewal policy details:\n\n• Policy Ref: {data['policy_number']} ({data['previous_insurer']})\n• Vehicle: {data['vehicle_make']} {data['vehicle_model']} ({data['vehicle_registration']})\n• IDV: ₹{idv_val:,} | NCB: {data['ncb_percent']}%\n\nRedirecting you to the Instant Policy Renewal page with everything autofilled."
        
        return TurnResponse(
            reply=strip_asterisks(summary_msg),
            session=session,
            event="autofill_ready_renew",
            autofill_data=data,
            target_url=target_url
        )

    return TurnResponse(
        reply=strip_asterisks(f"Thank you, {account_name}! I have collected your details. You can now proceed to explore custom insurance plans."),
        session=session,
        event="recommendation",
        target_url="/policies"
    )

def common_answer(text: str) -> str:
    lower = text.lower()
    if "deductible" in lower:
        return "A deductible is the statutory amount you pay toward a claim before the insurer covers the rest. A higher voluntary deductible reduces your annual premium."
    if "ncb" in lower or "no claim bonus" in lower:
        return "No Claim Bonus (NCB) is a reward discount on your Own Damage premium (20% to 50%) for claim-free policy years. It belongs to you and transfers 100% when switching insurers."
    if "idv" in lower or "insured declared value" in lower:
        return "IDV (Insured Declared Value) is the maximum insured sum for vehicle total loss or theft, calculated by applying standard depreciation to the manufacturer selling price."
    if "third party" in lower:
        return "Third-Party insurance is mandatory legal cover protecting against liability for third-party bodily injury, death, and property damage."
    if "comprehensive" in lower:
        return "Comprehensive motor insurance covers both mandatory third-party liability and Own Damage protection (accidents, theft, fire, and natural calamities)."
    if "premium" in lower:
        return "Your premium is computed based on IDV, vehicle CC, age, claims history, NCB discount, add-ons, and statutory 18% GST."
    return "Insurance provides financial risk protection where the insurer reimburses covered losses in exchange for premium payments."

