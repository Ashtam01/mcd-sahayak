import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Load .env from the backend directory (parent of app/)
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL:
    raise ValueError("Missing SUPABASE_URL in environment variables.")

# Prefer Service Role Key for backend operations to bypass RLS
key_to_use = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY

if not key_to_use:
    raise ValueError("Missing SUPABASE_KEY or SUPABASE_SERVICE_ROLE_KEY in .env")

if SUPABASE_SERVICE_ROLE_KEY:
    print("✅ Using SUPABASE_SERVICE_ROLE_KEY (RLS Bypassed)")
else:
    print("⚠️  Using SUPABASE_KEY (Anon Key) - RLS Policies Required")

supabase: Client = create_client(SUPABASE_URL, key_to_use)