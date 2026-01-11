-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store document chunks
create table if not exists document_chunks (
  id bigserial primary key,
  content text, -- The text content of the chunk
  metadata jsonb, -- Associated metadata like filename, page number, etc.
  embedding vector(384) -- 384 dimensions for all-MiniLM-L6-v2
);

-- Turn on Row Level Security (RLS) for security
alter table document_chunks enable row level security;

-- Create a policy to allow anyone to read (adjust as needed for your app)
drop policy if exists "Allow public read access" on document_chunks;
create policy "Allow public read access"
  on document_chunks
  for select
  to public
  using (true);

-- Create a policy to allow public inserts (since backend uses anon key)
drop policy if exists "Allow public insert" on document_chunks;
drop policy if exists "Allow authenticated insert" on document_chunks; -- Cleanup old policy if exists
create policy "Allow public insert"
  on document_chunks
  for insert
  to public
  with check (true);

-- Drop the function if it exists to allow return type changes
drop function if exists match_documents(vector, double precision, integer);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;
