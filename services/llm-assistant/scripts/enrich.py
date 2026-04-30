import os
import asyncio
from dotenv import load_dotenv
from supabase.client import create_client, Client
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

llm = ChatOpenAI(model="gpt-4o-mini")
embeddings = OpenAIEmbeddings()

async def generate_rich_description(game: dict):
    prompt = ChatPromptTemplate.from_template("""
    Create a rich, 2-sentence description for a game with these details:
    Title: {title}
    Platform: {platform}
    Genre: {genre}
    
    The description should focus on gameplay style, themes, and "vibe" to help with semantic search.
    Do not mention the title or platform in the description itself.
    """)
    chain = prompt | llm | StrOutputParser()
    return await chain.ainvoke({
        "title": game['title'],
        "platform": game['platform'],
        "genre": game['genre']
    })

async def enrich_all_games():
    print("Fetching games from Supabase...")
    # Adjust table name if necessary
    response = supabase.table("Game").select("*").execute()
    games = response.data

    for game in games:
        print(f"Processing {game['title']}...")
        
        # 1. Generate Description
        description = await generate_rich_description(game)
        content_to_embed = f"Title: {game['title']}. Genre: {game['genre']}. Description: {description}"
        
        # 2. Generate Embedding
        vector = embeddings.embed_query(content_to_embed)
        
        # 3. Store in game_embeddings table
        # We use a UPSERT logic based on game_id
        data = {
            "game_id": game['id'],
            "content": content_to_embed,
            "embedding": vector,
            "metadata": {
                "title": game['title'],
                "genre": game['genre'],
                "platform": game['platform']
            }
        }
        
        supabase.table("game_embeddings").upsert(data).execute()
        print(f"Successfully enriched {game['title']}")

if __name__ == "__main__":
    asyncio.run(enrich_all_games())
