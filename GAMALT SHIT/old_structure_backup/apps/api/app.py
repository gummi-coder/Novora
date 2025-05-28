from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta, datetime
import os
from dotenv import load_dotenv
from database import db

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:8080"]}})

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-super-secret-key-2024')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# Configure Database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://localhost/employee_survey')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Import and register blueprints
from routes.auth import auth_bp
from routes.surveys import surveys_bp
from routes.responses import responses_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(surveys_bp, url_prefix='/api/surveys')
app.register_blueprint(responses_bp, url_prefix='/api/responses')

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    })

if __name__ == '__main__':
    app.run(port=3000, debug=True) 