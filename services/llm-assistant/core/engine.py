import os
from typing import List, Dict
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import SupabaseVectorStore
from supabase.client import create_client, Client
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

class GameSearchEngine:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        
        self.embeddings = OpenAIEmbeddings()
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        
        # Table name where vectors are stored
        self.table_name = "game_embeddings"
        
        self.vector_store = SupabaseVectorStore(
            client=self.client,
            embedding=self.embeddings,
            table_name=self.table_name,
            query_name="match_games" # This is a Postgres function we need to create
        )

    async def search(self, query: str, top_k: int = 5) -> List[Dict]:
        """Performs semantic search using vector similarity."""
        docs = self.vector_store.similarity_search(query, k=top_k)
        return [
            {
                "id": doc.metadata.get("game_id"),
                "content": doc.page_content,
                "metadata": doc.metadata
            }
            for doc in docs
        ]

    async def recommend(self, preferences: str, history: List[str] = []) -> str:
        """Uses LLM to generate a personalized recommendation based on search results."""
        # 1. Search for games matching preferences
        search_results = await self.search(preferences, top_k=3)
        context = "\n".join([r["content"] for r in search_results])
        
        # 2. Build prompt
        prompt = ChatPromptTemplate.from_template("""
        You are a gaming expert for the "Game Library" app. 
        A user is looking for recommendations based on these preferences: {preferences}
        Their borrowing history: {history}
        
        Available games related to their request:
        {context}
        
        Provide a friendly, concise recommendation. Explain WHY these games fit their taste.
        If history is provided, try to find patterns or suggest something different but relevant.
        """)
        
        chain = prompt | self.llm | StrOutputParser()
        
        response = await chain.ainvoke({
            "preferences": preferences,
            "history": history,
            "context": context
        })
        
        return response
