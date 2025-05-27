from app import app, db
from sqlalchemy import text

def reset_db():
    with app.app_context():
        # Drop all tables with CASCADE
        with db.engine.connect() as conn:
            conn.execute(text('DROP SCHEMA public CASCADE;'))
            conn.execute(text('CREATE SCHEMA public;'))
            conn.commit()
        print("Dropped all tables")
        
        # Create all tables
        db.create_all()
        print("Created all tables")

if __name__ == '__main__':
    reset_db() 