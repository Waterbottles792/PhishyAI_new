"""
Generate sample phishing/legitimate email dataset for testing.

This creates a small synthetic dataset that can be used to test the system
without requiring a large external dataset.

Usage:
    python scripts/generate_sample_data.py
"""

import pandas as pd
from pathlib import Path
import random

# Sample phishing emails
PHISHING_EMAILS = [
    "URGENT: Your account has been suspended due to unauthorized access. Click here immediately to verify your identity: http://192.168.1.1/verify or your account will be permanently deleted within 24 hours.",
    "Congratulations! You've won $1,000,000 in our exclusive lottery! Claim your prize now by clicking this link: http://bit.ly/claim-prize. Act fast, this offer expires soon!",
    "Dear Customer, We have detected suspicious activity on your PayPal account. Verify your information immediately: http://paypal-secure.xyz/login or your account will be locked.",
    "WARNING: Your email account will be closed! We need you to confirm your password. Click here now: http://email-verify.click to prevent account termination.",
    "You have been selected for a special reward! Free iPhone 15 Pro waiting for you. Click to claim: http://192.168.0.100/gift Limited time offer!",
    "FINAL NOTICE: Your package delivery has failed. Update your address now: http://delivery-update.top/track?id=12345 or your package will be returned.",
    "Dear valued member, your credit card has been compromised. Immediate action required! Update your details: http://secure-bank.ml/update to prevent fraud.",
    "URGENT SECURITY ALERT: Unusual activity detected. Verify your identity immediately by clicking here: http://tinyurl.com/verify-now Don't delay!",
    "You've received a payment of $5000! Click here to accept: http://payment-secure.info/accept Your funds are waiting!",
    "Dear sir/madam, Your account requires verification. Click here within 12 hours: http://verify-account.buzz/login Important!",
]

# Sample legitimate emails
LEGITIMATE_EMAILS = [
    "Hey Sarah, Just wanted to confirm our meeting tomorrow at 3pm in Conference Room B. I'll bring the Q3 reports. Let me know if you need anything else. Best regards, Mike",
    "Hi Team, Please find attached the updated project timeline. We're on track for the launch next month. Let's sync up on Friday to discuss any blockers. Thanks, Jennifer",
    "Good morning! Your Amazon order #123-4567890-1234567 has been shipped and will arrive by Thursday. Track your package at https://www.amazon.com/track Best, Amazon Customer Service",
    "Hello, Thank you for your purchase! Your receipt is attached. If you have any questions, please don't hesitate to contact us at support@company.com. Warm regards, The Team",
    "Hi everyone, Reminder that the office will be closed on Monday for the holiday. Have a great weekend! - HR Department",
    "Dear John, Your flight booking has been confirmed for June 15th. Boarding pass attached. See you at the airport! Safe travels, Delta Airlines",
    "Hey! Want to grab lunch tomorrow? There's a new Thai place that just opened downtown. My treat! Let me know. - Alex",
    "Good afternoon, Your subscription renewal is coming up next week. No action needed - it will auto-renew. Thanks for being a loyal customer! Best, Service Team",
    "Hi Dr. Smith, Following up on our discussion from last week. I've completed the research you requested. Please find my findings in the attached document. Sincerely, Research Assistant",
    "Hello, This is a reminder about your dentist appointment on Thursday at 2pm. Please call if you need to reschedule. See you soon! - Smile Dental Care",
]

def generate_sample_dataset(output_path: str = "data/raw/sample_emails.csv", num_samples: int = 200):
    """
    Generate a sample dataset with phishing and legitimate emails.

    Args:
        output_path: Path to save the CSV file
        num_samples: Total number of samples to generate
    """
    print("Generating sample email dataset...")

    emails = []
    labels = []

    # Generate roughly balanced dataset
    num_phishing = num_samples // 2
    num_legitimate = num_samples - num_phishing

    # Generate phishing samples
    for i in range(num_phishing):
        email = random.choice(PHISHING_EMAILS)
        # Add some variation
        email = email.replace("Dear Customer", random.choice(["Dear Customer", "Dear User", "Dear Member", "Dear Valued Customer"]))
        emails.append(email)
        labels.append("Phishing")

    # Generate legitimate samples
    for i in range(num_legitimate):
        email = random.choice(LEGITIMATE_EMAILS)
        emails.append(email)
        labels.append("Safe")

    # Create DataFrame
    df = pd.DataFrame({
        'text': emails,
        'label': labels
    })

    # Shuffle
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    # Save to CSV
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)

    print(f"✓ Generated {len(df)} sample emails")
    print(f"  - Phishing: {(df['label']=='Phishing').sum()}")
    print(f"  - Legitimate: {(df['label']=='Safe').sum()}")
    print(f"✓ Saved to: {output_path}")
    print("\nNext steps:")
    print(f"  1. python scripts/preprocess.py --input {output_path}")
    print("  2. python scripts/train.py --data data/processed/features.csv")
    print("  3. uvicorn app.main:app --reload")


if __name__ == "__main__":
    generate_sample_dataset()
