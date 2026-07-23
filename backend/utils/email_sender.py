import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config


def send_confirmation_email(parent_email, student_name, class_grade, registration_id):
    """Send confirmation email to parent and notification to admin."""
    
    if not all([Config.SMTP_EMAIL, Config.SMTP_APP_PASSWORD, Config.ADMIN_EMAIL]):
        print("Warning: SMTP credentials not configured. Email not sent.")
        return False
    
    try:
        # Email to parent
        parent_subject = "School Registration Confirmation"
        parent_body = f"""
        <html>
        <body>
            <h2>Registration Confirmation</h2>
            <p>Dear Parent/Guardian,</p>
            <p>We have received the registration application for <strong>{student_name}</strong>.</p>
            <p><strong>Registration Details:</strong></p>
            <ul>
                <li>Student Name: {student_name}</li>
                <li>Class Applied For: {class_grade}</li>
                <li>Registration ID: {registration_id}</li>
            </ul>
            <p>We will contact you soon regarding the admission process.</p>
            <p>Thank you for choosing our school!</p>
        </body>
        </html>
        """
        
        send_email(parent_email, parent_subject, parent_body)
        
        # Email to admin
        admin_subject = f"New Registration: {student_name}"
        admin_body = f"""
        <html>
        <body>
            <h2>New Student Registration</h2>
            <p>A new registration has been submitted:</p>
            <ul>
                <li>Student Name: {student_name}</li>
                <li>Class Applied For: {class_grade}</li>
                <li>Registration ID: {registration_id}</li>
                <li>Parent Email: {parent_email}</li>
            </ul>
            <p>Please review the application in the admin dashboard.</p>
        </body>
        </html>
        """
        
        send_email(Config.ADMIN_EMAIL, admin_subject, admin_body)
        
        return True
        
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def send_email(to_email, subject, html_body):
    """Send an email using SMTP."""
    msg = MIMEMultipart('alternative')
    msg['From'] = Config.SMTP_EMAIL
    msg['To'] = to_email
    msg['Subject'] = subject
    
    html_part = MIMEText(html_body, 'html')
    msg.attach(html_part)
    
    server = smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT)
    server.starttls()
    server.login(Config.SMTP_EMAIL, Config.SMTP_APP_PASSWORD)
    server.send_message(msg)
    server.quit()
