from datetime import datetime
import uuid
from config import Config


class Student:
    """Student model for registration data."""
    
    def __init__(self, data):
        self.full_name = data.get('full_name')
        self.date_of_birth = data.get('date_of_birth')
        self.gender = data.get('gender')
        self.class_grade = data.get('class_grade')
        self.parent_name = data.get('parent_name')
        self.parent_contact = data.get('parent_contact')
        self.email = data.get('email')
        self.address = data.get('address')
        self.previous_school = data.get('previous_school', '')
        self.photo_url = data.get('photo_url', '')
        self.registration_id = self._generate_registration_id()
        self.timestamp = datetime.utcnow()
        self.status = 'pending'  # pending, approved, rejected
    
    def _generate_registration_id(self):
        """Generate a unique registration ID."""
        year = datetime.now().year
        unique_id = str(uuid.uuid4())[:8].upper()
        return f"REG{year}{unique_id}"
    
    def to_dict(self):
        """Convert student object to dictionary."""
        return {
            'registration_id': self.registration_id,
            'full_name': self.full_name,
            'date_of_birth': self.date_of_birth,
            'gender': self.gender,
            'class_grade': self.class_grade,
            'parent_name': self.parent_name,
            'parent_contact': self.parent_contact,
            'email': self.email,
            'address': self.address,
            'previous_school': self.previous_school,
            'photo_url': self.photo_url,
            'timestamp': self.timestamp,
            'status': self.status
        }
    
    @staticmethod
    def from_dict(data):
        """Create student object from dictionary."""
        student = Student(data)
        student.registration_id = data.get('registration_id')
        student.timestamp = data.get('timestamp')
        student.status = data.get('status', 'pending')
        return student
