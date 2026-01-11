-- 1. Ensure the bucket exists and is public (idempotent)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do update set public = true;

-- 2. Allow public access to storage.objects for the 'documents' bucket
-- Policy for INSERT (Uploads)
drop policy if exists "Allow public uploads" on storage.objects;
create policy "Allow public uploads"
on storage.objects
for insert
to public
with check (
  bucket_id = 'documents'
);

-- Policy for SELECT (Downloads/Reads)
drop policy if exists "Allow public downloads" on storage.objects;
create policy "Allow public downloads"
on storage.objects
for select
to public
using (
  bucket_id = 'documents'
);

-- Policy for UPDATE (optional, if needed)
drop policy if exists "Allow public updates" on storage.objects;
create policy "Allow public updates"
on storage.objects
for update
to public
using ( bucket_id = 'documents' );

-- Policy for DELETE (optional, needed for cleanup)
drop policy if exists "Allow public delete" on storage.objects;
create policy "Allow public delete"
on storage.objects
for delete
to public
using ( bucket_id = 'documents' );
