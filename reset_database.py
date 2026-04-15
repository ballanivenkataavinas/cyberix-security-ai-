"""
Reset Database Script for Cyberix AI
This script deletes the existing database and recreates it with default users
"""
import os
import sys
from pathlib import Path

def reset_database():
    """Reset the database by deleting and recreating it"""
    
    print("=" * 60)
    print("Cyberix AI - Database Reset")
    print("=" * 60)
    
    # Database file path
    db_path = Path("backend/cyberix.db")
    
    # Check if database exists
    if db_path.exists():
        print(f"\n✓ Found existing database: {db_path}")
        confirm = input("\n⚠️  Are you sure you want to delete the database? (yes/no): ")
        
        if confirm.lower() != 'yes':
            print("\n❌ Database reset cancelled.")
            return
        
        try:
            os.remove(db_path)
            print(f"\n✓ Database deleted successfully!")
        except Exception as e:
            print(f"\n❌ Error deleting database: {e}")
            return
    else:
        print(f"\n✓ No existing database found at: {db_path}")
    
    print("\n" + "=" * 60)
    print("Database Reset Complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Run: python run.py")
    print("2. The database will be recreated automatically")
    print("3. Default accounts will be created:")
    print("   • Admin: admin@cyberix.ai / Admin$123")
    print("   • User:  user@cyberix.ai / User$123")
    print("\n" + "=" * 60)

if __name__ == "__main__":
    try:
        reset_database()
    except KeyboardInterrupt:
        print("\n\n❌ Database reset cancelled by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
