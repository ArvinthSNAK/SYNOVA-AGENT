import re
from app.models import AdvisorSession, Intent, TurnResponse

WORKFLOWS: dict[str, list[tuple[str, str]]] = {
    "HEALTH_INSURANCE": [("target_person", "Is this cover for yourself, your family, or your parents?"), ("age", "What are the ages of the people you want to cover?"), ("city", "Which city do they live in?"), ("medical_conditions", "Do they have any pre-existing medical conditions?"), ("coverage_amount", "What level of health cover would feel comfortable for you?")],
    "LIFE_INSURANCE": [("age", "What is your age?"), ("occupation", "What do you do for work?"), ("income", "What is your approximate annual income?"), ("dependents", "How many people rely on your income?"), ("financial_goals", "What would you most like this policy to protect: family income, a loan, or long-term goals?")],
    "CAR_INSURANCE": [("purchase_type", "Is this a new car policy or a renewal?"), ("vehicle_number", "What is the vehicle registration number?"), ("rc_book", "Please upload a clear photo or PDF of the RC book."), ("driving_license", "Please upload your driving licence."), ("previous_claims", "Have you made any claims in the last policy year?"), ("city", "Which city is the car primarily used in?")],
    "RENEWAL": [("renewal_choice", "Would you like to continue with your current insurer, or compare new renewal options?"), ("policy_document", "Please upload your current policy document. I’ll review its coverage, premium, and expiry before advising you.")],
    "CLAIM": [("incident_type", "I’m sorry that happened. What happened, and when did it occur?"), ("incident_location", "Where did the incident occur?"), ("photos", "Please upload any photos or supporting documents you have.")]
}

def detect_intent(text: str) -> Intent:
    lower = text.lower()
    question_phrases = ("what is", "what are", "what does", "how does", "how do", "why is", "explain", "meaning of", "tell me about")
    is_question = any(phrase in lower for phrase in question_phrases)
    if any(x in lower for x in ("deductible", "no claim bonus", " ncb", " idv", "third party", "comprehensive cover")) or is_question and any(x in lower for x in ("insurance", "policy", "premium", "cover")): return "POLICY_QUERY"
    if any(x in lower for x in ("renew", "expiry", "expire")): return "RENEW_INSURANCE"
    if any(x in lower for x in ("accident", "claim", "damage", "crash")): return "CLAIM_ASSISTANCE"
    if any(x in lower for x in ("compare", "comparison")): return "POLICY_COMPARISON"
    if any(x in lower for x in ("health score", "insurance score")): return "INSURANCE_HEALTH_SCORE"
    if any(x in lower for x in ("cover", "policy detail", "does my policy")): return "POLICY_QUERY"
    if any(x in lower for x in ("insurance", "cover", "policy", "buy")): return "NEW_INSURANCE"
    return "UNKNOWN"

def detect_workflow(text: str, intent: Intent) -> str | None:
    lower = text.lower()
    if intent == "RENEW_INSURANCE": return "RENEWAL"
    if intent == "CLAIM_ASSISTANCE": return "CLAIM"
    for term, flow in (("health", "HEALTH_INSURANCE"), ("medical", "HEALTH_INSURANCE"), ("life", "LIFE_INSURANCE"), ("car", "CAR_INSURANCE"), ("motor", "CAR_INSURANCE")):
        if term in lower: return flow
    return None

def next_turn(session: AdvisorSession, transcript: str) -> TurnResponse:
    text = transcript.strip()
    if session.stage == "IDENTIFY_INTENT":
        session.intent = detect_intent(text); session.workflow = detect_workflow(text, session.intent)
        if session.intent == "POLICY_QUERY":
            return TurnResponse(reply=common_answer(text), session=session)
        if session.intent == "UNKNOWN": return TurnResponse(reply="I can help you buy or renew insurance, understand a policy, compare cover, check your insurance health, or start a claim. Which would you like to do?", session=session)
        if session.workflow is None and session.intent == "NEW_INSURANCE":
            session.stage = "IDENTIFY_INSURANCE_TYPE"
            return TurnResponse(reply="What type of insurance are you looking for — health, life, car, bike, or travel?", session=session)
        if session.workflow is None:
            return TurnResponse(reply="I’ll help with that. Please tell me whether this is health, life, car, bike, or travel insurance.", session=session)
        session.stage = "COLLECT"
    elif session.stage == "IDENTIFY_INSURANCE_TYPE":
        session.workflow = detect_workflow(text, "NEW_INSURANCE")
        if not session.workflow: return TurnResponse(reply="I caught that you need insurance, but not the type. Is it health, life, car, bike, or travel?", session=session)
        session.stage = "COLLECT"
    elif session.stage.startswith("COLLECT_") and session.workflow:
        previous_field = session.stage.removeprefix("COLLECT_").lower()
        session.collected_data[previous_field] = text
    fields = WORKFLOWS[session.workflow]
    pending = next(((key, question) for key, question in fields if key not in session.collected_data), None)
    if pending:
        session.stage = f"COLLECT_{pending[0].upper()}"
        return TurnResponse(reply=pending[1], session=session)
    session.stage = "RECOMMEND"
    return TurnResponse(reply="Thank you — I have the essentials. I’m preparing a transparent recommendation based on your needs and will show the cover, estimated premium, and key trade-offs next.", session=session, event="recommendation")

def common_answer(text: str) -> str:
    lower = text.lower()
    if "deductible" in lower: return "A deductible is the amount you pay toward a covered claim before the insurer pays the rest. A higher deductible can reduce your premium, but you should choose an amount you can comfortably afford."
    if "ncb" in lower or "no claim bonus" in lower: return "No Claim Bonus is a discount for making no claims during the policy year. It can reduce your own-damage premium and may transfer when you switch insurers, subject to proof and insurer rules."
    if "idv" in lower or "insured declared value" in lower: return "IDV is the insured value of your vehicle for total loss or theft. It should be close to the vehicle’s current market value, because choosing too little can reduce a future settlement."
    if "third party" in lower: return "Third-party insurance covers your legal liability for injury, death, or property damage caused to another person. It does not cover damage to your own vehicle."
    if "comprehensive" in lower: return "Comprehensive motor insurance combines third-party liability cover with protection for your own vehicle against risks such as accidents, theft, fire, and selected natural events, subject to exclusions."
    if "premium" in lower: return "A premium is the amount you pay for insurance. It depends on factors such as the cover selected, vehicle or member details, location, claims history, deductible, and add-ons."
    return "Insurance is a contract where you pay a premium and the insurer helps cover specified financial losses, risks, or expenses. The exact protection depends on the policy wording, limits, exclusions, and deductible."
