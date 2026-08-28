from app.advisor import next_turn
from app.models import AdvisorSession

def test_health_flow_starts_with_target_person():
    reply = next_turn(AdvisorSession(session_id="test"), "I need health insurance")
    assert reply.session.workflow == "HEALTH_INSURANCE"
    assert "yourself" in reply.reply

def test_unknown_intent_requests_clarification():
    reply = next_turn(AdvisorSession(session_id="test"), "hello")
    assert reply.session.intent == "UNKNOWN"
    assert "buy or renew" in reply.reply
