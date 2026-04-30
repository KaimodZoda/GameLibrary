-- 1. Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- 2. Create the table for game embeddings
create table if not exists game_embeddings (
  id bigserial primary key,
  game_id text not null unique, -- UUID or ID from your Game table
  content text,                 -- The text used to generate the embedding
  embedding vector(1536),       -- 1536 is the dimension for OpenAI's text-embedding-3-small
  metadata jsonb                -- Extra info like title, genre, etc.
);

-- 3. Create a function to search for games using vector similarity
-- This is used by LangChain's SupabaseVectorStore
create or replace function match_games (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  game_id text,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    game_embeddings.id,
    game_embeddings.game_id,
    game_embeddings.content,
    game_embeddings.metadata,
    1 - (game_embeddings.embedding <=> query_embedding) as similarity
  from game_embeddings
  where 1 - (game_embeddings.embedding <=> query_embedding) > match_threshold
  order by game_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
