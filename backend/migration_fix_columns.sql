-- Add assigned_to if it doesn't exist
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS assigned_to text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

-- Ensure status is consistent
UPDATE public.complaints 
SET status = 'In Progress' 
WHERE status = 'in-progress';
