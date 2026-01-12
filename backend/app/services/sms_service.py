import os
from twilio.rest import Client

def send_complaint_sms(to_number: str, complaint_number: str, category: str):
    """
    Sends an SMS notification about a logged complaint.
    Defaults to the environment variable TWILIO_PHONE_NUMBER if to_number is not provided or valid? 
    Actually, for this demo, we will force send to the specific number requested by the user
    if they provided one, or just trust the to_number passed in if it's the user's number.
    
    The user said: "send sms to a number... use my number... 8287992338"
    """
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    from_number = os.environ.get('TWILIO_PHONE_NUMBER')
    
    # HARDCODED DEMO NUMBER as requested by user for the trial
    # "use my number which is in twilio 8287992338"
    # We will override the recipient to ensure they get it during the demo
    DEMO_RECIPIENT = "+918287992338" 

    if not all([account_sid, auth_token, from_number]):
        print("Twilio credentials missing. SMS not sent.")
        return

    try:
        client = Client(account_sid, auth_token)
        
        body_text = (
            f"🔔 MCD Sahayak Update\n"
            f"Complaint Registered: {complaint_number}\n"
            f"Category: {category}\n"
            f"We have received your grievance and it is being processed."
        )

        message = client.messages.create(
            body=body_text,
            from_=from_number,
            to=DEMO_RECIPIENT # Sending to the user's number for the trial
        )
        print(f"✅ SMS sent to {DEMO_RECIPIENT}: {message.sid}")
        return message.sid
    except Exception as e:
        print(f"❌ Failed to send SMS: {e}")
        return None

def send_broadcast_sms(to_number: str, message_body: str):
    """
    Sends a generic broadcast SMS.
    Returns: (success: bool, message: str)
    """
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    from_number = os.environ.get('TWILIO_PHONE_NUMBER')
    
    if not all([account_sid, auth_token, from_number]):
        msg = "Twilio credentials missing. SMS not sent."
        print(msg)
        return False, msg

    # Ensure E.164 format (default to India +91 if missing)
    if not to_number.startswith('+'):
        to_number = f"+91{to_number}"

    try:
        client = Client(account_sid, auth_token)
        
        message = client.messages.create(
            body=message_body,
            from_=from_number,
            to=to_number
        )
        msg = f"✅ Broadcast SMS sent to {to_number}: {message.sid}"
        print(msg)
        return True, msg
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Failed to send Broadcast SMS: {error_msg}")
        return False, error_msg
