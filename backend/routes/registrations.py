from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from config import Config
from models.student import Student
from utils.validators import validate_student_data, sanitize_input
from utils.email_sender import send_confirmation_email
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

registrations_bp = Blueprint('registrations', __name__)


def get_db_collection():
    """Get MongoDB collection."""
    client = MongoClient(Config.MONGO_URI)
    db = client[Config.DB_NAME]
    return db[Config.COLLECTION_NAME]


@registrations_bp.route('/api/register', methods=['POST'])
def register_student():
    """Register a new student."""
    try:
        data = request.get_json()
        
        # Validate input
        errors = validate_student_data(data)
        if errors:
            return jsonify({'success': False, 'errors': errors}), 400
        
        # Sanitize inputs
        sanitized_data = {}
        for key, value in data.items():
            if isinstance(value, str):
                sanitized_data[key] = sanitize_input(value)
            else:
                sanitized_data[key] = value
        
        # Create student object
        student = Student(sanitized_data)
        
        # Save to database
        collection = get_db_collection()
        collection.insert_one(student.to_dict())
        
        # Send confirmation email
        send_confirmation_email(
            student.email,
            student.full_name,
            student.class_grade,
            student.registration_id
        )
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'registration_id': student.registration_id
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@registrations_bp.route('/api/registrations', methods=['GET'])
def get_registrations():
    """Get all registrations (admin-only)."""
    try:
        # Basic admin check (in production, use proper authentication)
        auth_header = request.headers.get('Authorization')
        if not auth_header or auth_header != f'Bearer {Config.SECRET_KEY}':
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        
        collection = get_db_collection()
        
        # Get query parameters for filtering
        search = request.args.get('search', '')
        status_filter = request.args.get('status', '')
        
        # Build query
        query = {}
        if search:
            query['$or'] = [
                {'full_name': {'$regex': search, '$options': 'i'}},
                {'class_grade': {'$regex': search, '$options': 'i'}}
            ]
        if status_filter:
            query['status'] = status_filter
        
        registrations = list(collection.find(query, {'_id': 0}).sort('timestamp', -1))
        
        return jsonify({'success': True, 'registrations': registrations}), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@registrations_bp.route('/api/registrations/<registration_id>', methods=['GET'])
def get_registration(registration_id):
    """Get a single registration by ID."""
    try:
        collection = get_db_collection()
        registration = collection.find_one(
            {'registration_id': registration_id},
            {'_id': 0}
        )
        
        if not registration:
            return jsonify({'success': False, 'error': 'Registration not found'}), 404
        
        return jsonify({'success': True, 'registration': registration}), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@registrations_bp.route('/api/registrations/<registration_id>', methods=['DELETE'])
def delete_registration(registration_id):
    """Delete a registration (admin-only)."""
    try:
        # Basic admin check
        auth_header = request.headers.get('Authorization')
        if not auth_header or auth_header != f'Bearer {Config.SECRET_KEY}':
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        
        collection = get_db_collection()
        result = collection.delete_one({'registration_id': registration_id})
        
        if result.deleted_count == 0:
            return jsonify({'success': False, 'error': 'Registration not found'}), 404
        
        return jsonify({'success': True, 'message': 'Registration deleted'}), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@registrations_bp.route('/api/registrations/<registration_id>/status', methods=['PUT'])
def update_registration_status(registration_id):
    """Update registration status (admin-only)."""
    try:
        # Basic admin check
        auth_header = request.headers.get('Authorization')
        if not auth_header or auth_header != f'Bearer {Config.SECRET_KEY}':
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['pending', 'approved', 'rejected']:
            return jsonify({'success': False, 'error': 'Invalid status'}), 400
        
        collection = get_db_collection()
        result = collection.update_one(
            {'registration_id': registration_id},
            {'$set': {'status': new_status}}
        )
        
        if result.modified_count == 0:
            return jsonify({'success': False, 'error': 'Registration not found'}), 404
        
        return jsonify({'success': True, 'message': 'Status updated'}), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
