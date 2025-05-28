from flask import Blueprint, jsonify, request
from functools import wraps
from models import User
from utils.auth import admin_required
import os
from dotenv import load_dotenv
import json
from datetime import datetime

config_bp = Blueprint('config', __name__)

def validate_env_key(key):
    """Validate environment variable key format"""
    return key.isupper() and key.replace('_', '').isalnum()

@config_bp.route('/env', methods=['GET'])
@admin_required
def get_env_config():
    """Get current environment configuration (excluding sensitive values)"""
    try:
        # Load current .env file
        load_dotenv()
        
        # Get all environment variables
        env_vars = {}
        for key in os.environ:
            if key.startswith('APP_'):
                # For sensitive values, only show if they are set
                if any(sensitive in key.lower() for sensitive in ['key', 'secret', 'password', 'token']):
                    env_vars[key] = '****' if os.environ[key] else None
                else:
                    env_vars[key] = os.environ[key]
        
        return jsonify({
            'status': 'success',
            'data': env_vars
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@config_bp.route('/env', methods=['POST'])
@admin_required
def update_env_config():
    """Update environment configuration"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400

        # Validate all keys
        for key in data:
            if not validate_env_key(key):
                return jsonify({
                    'status': 'error',
                    'message': f'Invalid key format: {key}. Keys must be uppercase and alphanumeric with underscores.'
                }), 400

        # Read current .env file
        env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
        current_vars = {}
        if os.path.exists(env_path):
            with open(env_path, 'r') as f:
                for line in f:
                    if line.strip() and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        current_vars[key] = value

        # Update variables
        current_vars.update(data)

        # Write back to .env file
        with open(env_path, 'w') as f:
            f.write(f"# Environment configuration updated at {datetime.now().isoformat()}\n")
            for key, value in current_vars.items():
                f.write(f"{key}={value}\n")

        # Reload environment variables
        load_dotenv(override=True)

        return jsonify({
            'status': 'success',
            'message': 'Environment configuration updated successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@config_bp.route('/env/validate', methods=['POST'])
@admin_required
def validate_env_config():
    """Validate environment configuration"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400

        required_vars = {
            'APP_DATABASE_URL': 'Database connection URL',
            'APP_SECRET_KEY': 'Application secret key',
            'APP_MAIL_SERVER': 'Mail server configuration',
            'APP_MAIL_PORT': 'Mail server port',
            'APP_MAIL_USERNAME': 'Mail server username',
            'APP_MAIL_PASSWORD': 'Mail server password'
        }

        missing_vars = []
        invalid_vars = []

        # Check required variables
        for var, description in required_vars.items():
            if var not in data:
                missing_vars.append(f"{var} ({description})")
            elif not data[var]:
                invalid_vars.append(f"{var} ({description})")

        # Validate key formats
        for key in data:
            if not validate_env_key(key):
                invalid_vars.append(f"{key} (Invalid format)")

        if missing_vars or invalid_vars:
            return jsonify({
                'status': 'error',
                'missing_variables': missing_vars,
                'invalid_variables': invalid_vars
            }), 400

        return jsonify({
            'status': 'success',
            'message': 'Environment configuration is valid'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@config_bp.route('/env/backup', methods=['POST'])
@admin_required
def backup_env_config():
    """Create a backup of the current environment configuration"""
    try:
        env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
        if not os.path.exists(env_path):
            return jsonify({
                'status': 'error',
                'message': 'No .env file found'
            }), 404

        # Create backup directory if it doesn't exist
        backup_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backups')
        os.makedirs(backup_dir, exist_ok=True)

        # Create backup file with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_path = os.path.join(backup_dir, f'.env.backup_{timestamp}')

        # Copy current .env file to backup
        with open(env_path, 'r') as source, open(backup_path, 'w') as backup:
            backup.write(source.read())

        return jsonify({
            'status': 'success',
            'message': 'Environment configuration backed up successfully',
            'backup_file': os.path.basename(backup_path)
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@config_bp.route('/env/restore/<backup_file>', methods=['POST'])
@admin_required
def restore_env_config(backup_file):
    """Restore environment configuration from a backup"""
    try:
        backup_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            'backups',
            backup_file
        )
        
        if not os.path.exists(backup_path):
            return jsonify({
                'status': 'error',
                'message': 'Backup file not found'
            }), 404

        env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
        
        # Create current .env backup before restoring
        current_backup = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            'backups',
            f'.env.pre_restore_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
        )
        
        if os.path.exists(env_path):
            with open(env_path, 'r') as source, open(current_backup, 'w') as backup:
                backup.write(source.read())

        # Restore from backup
        with open(backup_path, 'r') as source, open(env_path, 'w') as target:
            target.write(source.read())

        # Reload environment variables
        load_dotenv(override=True)

        return jsonify({
            'status': 'success',
            'message': 'Environment configuration restored successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 