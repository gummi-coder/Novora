import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.database import SessionLocal
from app.models.base import User
from app.core.security import get_password_hash

def fix_passwords():
    session = SessionLocal()
    try:
        # Get all users with plain text passwords
        users = session.query(User).filter(User.password_hash == "hashed_password_123").all()
        
        print(f"Found {len(users)} users with plain text passwords")
        
        for user in users:
            # Hash the password properly
            user.password_hash = get_password_hash("hashed_password_123")
            print(f"Fixed password for user: {user.email}")
        
        session.commit()
        print("All passwords have been properly hashed!")
        
    except Exception as e:
        print(f"Error fixing passwords: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    fix_passwords()
