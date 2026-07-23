import re
from datetime import datetime


def validate_student_data(data):
    """Validate student registration data."""
    errors = []
    
    # Required fields
    required_fields = [
        'full_name', 'date_of_birth', 'gender', 'class_grade',
        'parent_name', 'parent_contact', 'email', 'address'
    ]
    
    for field in required_fields:
        if not data.get(field):
            errors.append(f"{field.replace('_', ' ').title()} is required")
    
    # Validate email format
    if data.get('email'):
        if not is_valid_email(data['email']):
            errors.append("Invalid email format")
    
    # Validate phone number
    if data.get('parent_contact'):
        if not is_valid_phone(data['parent_contact']):
            errors.append("Invalid phone number format")
    
    # Validate date of birth
    if data.get('date_of_birth'):
        if not is_valid_date_of_birth(data['date_of_birth']):
            errors.append("Invalid date of birth")
    
    return errors


def is_valid_email(email):
    """Check if email has valid format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def is_valid_phone(phone):
    """Check if phone number is valid (10-15 digits)."""
    # Remove any non-digit characters
    cleaned = re.sub(r'[^\d]', '', phone)
    return len(cleaned) >= 10 and len(cleaned) <= 15 and cleaned.isdigit()


def is_valid_date_of_birth(dob):
    """Check if date of birth is valid and not in the future."""
    try:
        birth_date = datetime.strptime(dob, '%Y-%m-%d')
        return birth_date <= datetime.now()
    except ValueError:
        return False


def sanitize_input(text):
    """Sanitize user input to prevent XSS."""
    if not text:
        return text
    # Basic HTML escaping
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    text = text.replace('"', '&quot;')
    text = text.replace("'", '&#x27;')
    return text
