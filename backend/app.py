from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from routes.registrations import registrations_bp
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": Config.CORS_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Register blueprints
app.register_blueprint(registrations_bp)


@app.route('/')
def home():
    """Home route."""
    return jsonify({
        'message': 'School Registration API',
        'version': '1.0.0',
        'endpoints': {
            'register': 'POST /api/register',
            'get_registrations': 'GET /api/registrations',
            'get_registration': 'GET /api/registrations/<id>',
            'delete_registration': 'DELETE /api/registrations/<id>',
            'update_status': 'PUT /api/registrations/<id>/status'
        }
    })


@app.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'}), 200


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({'success': False, 'error': 'Internal server error'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=Config.DEBUG)
