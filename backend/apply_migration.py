import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Get DB URL
# Supabase provides: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
db_url = os.getenv("DATABASE_URL")
if not db_url:
    # Fallback construction if DATABASE_URL not set directly but other vars are
    # But usually Supabase requires the full string.
    # Let's try to construct it if missing, or error out.
    host = os.getenv("SUPABASE_DB_HOST")
    password = os.getenv("SUPABASE_DB_PASSWORD")
    if host and password:
        db_url = f"postgresql://postgres:{password}@{host}:5432/postgres"
    else:
        print("DATABASE_URL not found in .env")
        exit(1)

print(f"Connecting to database...")

try:
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()
    
    # 1. Add columns
    print("Adding columns...")
    cur.execute("""
    ALTER TABLE public.complaints 
    ADD COLUMN IF NOT EXISTS assigned_to text,
    ADD COLUMN IF NOT EXISTS notes text,
    ADD COLUMN IF NOT EXISTS resolved_at timestamptz;
    """)
    
    # 2. Update status inconsistent values
    print("Normalizing status...")
    cur.execute("""
    UPDATE public.complaints 
    SET status = 'In Progress' 
    WHERE status = 'in-progress';
    """)
    
    print("Migration successful!")
    cur.close()
    conn.close()

except Exception as e:
    print(f"Migration failed: {e}")
    exit(1)
