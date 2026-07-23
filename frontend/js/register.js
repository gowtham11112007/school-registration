const API_BASE_URL = window.API_URL || 'http://localhost:5002';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    
    if (form) {
        form.addEventListener('submit', handleSubmit);
        form.addEventListener('reset', handleReset);
        
        // Add real-time validation
        const requiredFields = ['full_name', 'date_of_birth', 'gender', 'class_grade', 
                               'parent_name', 'parent_contact', 'email', 'address'];
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                input.addEventListener('blur', () => validateField(field));
                input.addEventListener('input', () => clearError(field));
            }
        });
        
        // Special validation for email and phone
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => validateEmail());
        }
        
        const phoneInput = document.getElementById('parent_contact');
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => validatePhone());
        }
    }
});

function validateField(fieldName) {
    const input = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}_error`);
    
    if (!input || !errorElement) return true;
    
    if (!input.value.trim()) {
        errorElement.textContent = `${fieldName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
        input.style.borderColor = '#e74c3c';
        return false;
    }
    
    errorElement.textContent = '';
    input.style.borderColor = '#ddd';
    return true;
}

function validateEmail() {
    const email = document.getElementById('email');
    const errorElement = document.getElementById('email_error');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!email || !errorElement) return true;
    
    if (!email.value.trim()) {
        errorElement.textContent = 'Email is required';
        email.style.borderColor = '#e74c3c';
        return false;
    }
    
    if (!emailRegex.test(email.value)) {
        errorElement.textContent = 'Please enter a valid email address';
        email.style.borderColor = '#e74c3c';
        return false;
    }
    
    errorElement.textContent = '';
    email.style.borderColor = '#ddd';
    return true;
}

function validatePhone() {
    const phone = document.getElementById('parent_contact');
    const errorElement = document.getElementById('parent_contact_error');
    const phoneRegex = /^\d{10,15}$/;
    
    if (!phone || !errorElement) return true;
    
    const cleanedPhone = phone.value.replace(/\D/g, '');
    
    if (!cleanedPhone) {
        errorElement.textContent = 'Contact number is required';
        phone.style.borderColor = '#e74c3c';
        return false;
    }
    
    if (!phoneRegex.test(cleanedPhone)) {
        errorElement.textContent = 'Please enter a valid phone number (10-15 digits)';
        phone.style.borderColor = '#e74c3c';
        return false;
    }
    
    errorElement.textContent = '';
    phone.style.borderColor = '#ddd';
    return true;
}

function clearError(fieldName) {
    const input = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}_error`);
    
    if (input && errorElement) {
        errorElement.textContent = '';
        input.style.borderColor = '#ddd';
    }
}

function validateForm() {
    let isValid = true;
    
    const requiredFields = ['full_name', 'date_of_birth', 'gender', 'class_grade', 
                           'parent_name', 'parent_contact', 'email', 'address'];
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!validateEmail()) {
        isValid = false;
    }
    
    if (!validatePhone()) {
        isValid = false;
    }
    
    // Validate date of birth is not in the future
    const dobInput = document.getElementById('date_of_birth');
    if (dobInput && dobInput.value) {
        const dob = new Date(dobInput.value);
        const today = new Date();
        if (dob > today) {
            const errorElement = document.getElementById('date_of_birth_error');
            errorElement.textContent = 'Date of birth cannot be in the future';
            dobInput.style.borderColor = '#e74c3c';
            isValid = false;
        }
    }
    
    return isValid;
}

async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    const formData = new FormData(e.target);
    const data = {};
    
    formData.forEach((value, key) => {
        if (key !== 'photo') {
            data[key] = value;
        }
    });
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('registrationForm').classList.add('hidden');
            document.getElementById('successMessage').classList.remove('hidden');
            document.getElementById('registrationId').textContent = result.registration_id;
        } else {
            showError(result.errors || result.error || 'Registration failed');
        }
    } catch (error) {
        showError('Network error. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Registration';
    }
}

function handleReset() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
    
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => input.style.borderColor = '#ddd');
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    if (Array.isArray(message)) {
        errorText.innerHTML = message.join('<br>');
    } else {
        errorText.textContent = message;
    }
    
    errorDiv.classList.remove('hidden');
}

function hideError() {
    document.getElementById('errorMessage').classList.add('hidden');
}
