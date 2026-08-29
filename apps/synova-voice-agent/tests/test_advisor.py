from app.advisor import next_turn
from app.models import AdvisorSession

def test_health_flow_starts_with_target_person_and_account_name():
    session = AdvisorSession(session_id="test", collected_data={"customer_name": "Hariharan"})
    reply = next_turn(session, "I need health insurance", customer_name="Hariharan")
    assert reply.session.workflow == "HEALTH_INSURANCE"
    assert "yourself" in reply.reply.lower()

def test_greeting_uses_account_name():
    session = AdvisorSession(session_id="test")
    turn1 = next_turn(session, "hello", customer_name="Hariharan Murugesan")
    assert turn1.session.intent == "UNKNOWN"
    assert "hi hariharan murugesan" in turn1.reply.lower()
    assert "buy" in turn1.reply.lower() or "renew" in turn1.reply.lower()

def test_irrelevant_input_reasks_question():
    session = AdvisorSession(session_id="test-irrelevant", collected_data={"customer_name": "Hariharan"})
    turn1 = next_turn(session, "I want to buy new motor insurance", customer_name="Hariharan")
    assert turn1.session.stage == "COLLECT_VEHICLE_REGISTRATION"
    assert "vehicle registration" in turn1.reply.lower()
    
    # User responds with irrelevant input
    turn2 = next_turn(turn1.session, "i want to eat pizza", customer_name="Hariharan")
    assert turn2.session.stage == "COLLECT_VEHICLE_REGISTRATION"
    assert "didn't catch a valid vehicle registration" in turn2.reply.lower() or "vehicle registration" in turn2.reply.lower()
    
    # User provides valid registration
    turn3 = next_turn(turn2.session, "KA-01-MJ-4092", customer_name="Hariharan")
    assert turn3.session.stage == "COLLECT_VEHICLE_MAKE"
    assert "vehicle make" in turn3.reply.lower()

def test_renew_insurance_asks_for_policy_pdf():
    session = AdvisorSession(session_id="test-renew")
    turn1 = next_turn(session, "I want to renew my insurance", customer_name="Hariharan")
    assert turn1.session.workflow == "RENEWAL_MOTOR_INSURANCE"
    assert turn1.session.stage == "ASK_RENEWAL_PDF"
    assert turn1.event == "ask_renewal_pdf"
    assert "policy pdf" in turn1.reply.lower()

def test_renew_insurance_with_yes_navigates_to_renew_page():
    session = AdvisorSession(session_id="test-renew-yes")
    turn1 = next_turn(session, "Renew insurance", customer_name="Hariharan")
    assert turn1.session.stage == "ASK_RENEWAL_PDF"
    
    turn2 = next_turn(turn1.session, "Yes, I have my previous policy PDF", customer_name="Hariharan")
    assert turn2.session.stage == "RECOMMEND"
    assert turn2.event == "autofill_ready_renew"
    assert turn2.target_url == "/renew-insurance"
    assert "renewal page" in turn2.reply.lower()

def test_renew_insurance_with_pdf_in_single_turn():
    session = AdvisorSession(session_id="test-renew-direct")
    turn = next_turn(session, "I want to renew my policy and I have the PDF", customer_name="Hariharan")
    assert turn.session.workflow == "RENEWAL_MOTOR_INSURANCE"
    assert turn.session.stage == "RECOMMEND"
    assert turn.event == "autofill_ready_renew"
    assert turn.target_url == "/renew-insurance"

def test_renew_insurance_without_pdf_falls_back_to_manual_collection():
    session = AdvisorSession(session_id="test-renew-no", collected_data={"customer_name": "Hariharan"})
    turn1 = next_turn(session, "Renew my policy", customer_name="Hariharan")
    turn2 = next_turn(turn1.session, "No, enter details manually", customer_name="Hariharan")
    assert turn2.session.stage == "COLLECT_VEHICLE_REGISTRATION"
    assert turn2.event == "question"
    assert "vehicle registration" in turn2.reply.lower()

def test_full_new_motor_insurance_flow_requires_all_fields_before_autofill():
    session = AdvisorSession(session_id="test-full-new")
    
    # 1. Start flow
    t1 = next_turn(session, "I want to buy a new motor insurance policy", customer_name="Hariharan")
    assert t1.session.stage == "COLLECT_VEHICLE_REGISTRATION"
    assert t1.event == "question"
    assert t1.autofill_data is None
    assert "vehicle registration" in t1.reply.lower()

    # 2. Registration
    t2 = next_turn(t1.session, "KA 05 MN 1234", customer_name="Hariharan")
    assert t2.session.stage == "COLLECT_VEHICLE_MAKE"
    assert t2.event == "question"
    assert t2.autofill_data is None
    assert "vehicle make" in t2.reply.lower()

    # 3. Make
    t3 = next_turn(t2.session, "Hyundai", customer_name="Hariharan")
    assert t3.session.stage == "COLLECT_VEHICLE_MODEL"
    assert t3.event == "question"
    assert t3.autofill_data is None
    assert "vehicle model" in t3.reply.lower()

    # 4. Model
    t4 = next_turn(t3.session, "Creta SX", customer_name="Hariharan")
    assert t4.session.stage == "COLLECT_VEHICLE_AGE_YEARS"
    assert t4.event == "question"
    assert t4.autofill_data is None
    assert "vehicle age" in t4.reply.lower()

    # 5. Age
    t5 = next_turn(t4.session, "2 years", customer_name="Hariharan")
    assert t5.session.stage == "COLLECT_IDV"
    assert t5.event == "question"
    assert t5.autofill_data is None
    assert "idv" in t5.reply.lower()

    # 6. IDV
    t6 = next_turn(t5.session, "6.5 Lakhs", customer_name="Hariharan")
    assert t6.session.stage == "COLLECT_NCB_PERCENT"
    assert t6.event == "question"
    assert t6.autofill_data is None
    assert "ncb" in t6.reply.lower()

    # 7. NCB (Final answer -> should trigger autofill ready)
    t7 = next_turn(t6.session, "20%", customer_name="Hariharan")
    assert t7.session.stage == "RECOMMEND"
    assert t7.event == "autofill_ready_new"
    assert t7.autofill_data is not None
    assert t7.autofill_data["vehicle_registration"] == "KA-05-MN-1234"
    assert t7.autofill_data["vehicle_make"] == "Hyundai"
    assert t7.autofill_data["vehicle_model"] == "Creta SX"
    assert t7.autofill_data["vehicle_age_years"] == "2"
    assert t7.autofill_data["idv"] == "650000"
    assert t7.autofill_data["ncb_percent"] == "20"
    assert t7.target_url is not None
    assert "/new-insurance?" in t7.target_url

def test_completed_session_resets_on_new_request():
    # Simulate a previously completed session in RECOMMEND stage
    old_session = AdvisorSession(
        session_id="test-old-recommend",
        stage="RECOMMEND",
        workflow="NEW_MOTOR_INSURANCE",
        collected_data={
            "customer_name": "Hariharan",
            "vehicle_registration": "KA-01-MJ-4092",
            "vehicle_make": "Hyundai",
            "vehicle_model": "Creta SX",
            "vehicle_age_years": "2",
            "idv": "650000",
            "ncb_percent": "20"
        }
    )
    
    # User sends a new request "Buy new insurance"
    turn = next_turn(old_session, "I want to buy new insurance", customer_name="Hariharan")
    assert turn.session.stage == "COLLECT_VEHICLE_REGISTRATION"
    assert turn.event == "question"
    assert turn.autofill_data is None
    assert "vehicle registration" in turn.reply.lower()

