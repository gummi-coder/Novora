from app import app, db
from models import User
from werkzeug.security import generate_password_hash

def init_db():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if admin user exists
        admin = User.query.filter_by(email='admin@example.com').first()
        if not admin:
            admin = User(
                email='admin@example.com',
                password_hash=generate_password_hash('admin123'),
                role='admin'
            )
            db.session.add(admin)
            print("Created admin user")
        
        # Check if test employee exists
        employee = User.query.filter_by(email='employee@example.com').first()
        if not employee:
            employee = User(
                email='employee@example.com',
                password_hash=generate_password_hash('employee123'),
                role='employee'
            )
            db.session.add(employee)
            print("Created employee user")
        
        # Commit changes
        db.session.commit()
        print("Database initialized successfully!")

if __name__ == '__main__':
    init_db() 