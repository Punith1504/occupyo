from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import uvicorn

app = FastAPI(title="Occupyo ML Recommendation API")

# Mock data store for training (in production, fetch from PostgreSQL/Prisma)
class Property(BaseModel):
    id: str
    propertyType: str
    city: str
    amenities: List[str]
    description: str

class UserInteraction(BaseModel):
    userId: str
    propertyId: str
    interactionType: str # "VIEW", "FAVORITE", "LEASE"

# In-memory datasets
properties_db = []
interactions_db = []

@app.post("/ingest/property")
def ingest_property(prop: Property):
    properties_db.append(prop.dict())
    return {"status": "success"}

@app.post("/ingest/interaction")
def ingest_interaction(interaction: UserInteraction):
    interactions_db.append(interaction.dict())
    return {"status": "success"}

@app.get("/recommend/{user_id}")
def recommend_properties(user_id: str, limit: int = 5):
    if not properties_db:
        return {"recommendations": []}
    
    # 1. Content-Based Filtering Setup
    df_props = pd.DataFrame(properties_db)
    
    # Create a feature string for each property
    if "features" not in df_props.columns:
        df_props["features"] = df_props.apply(
            lambda x: f"{x['propertyType']} {x['city']} {' '.join(x['amenities'])}", axis=1
        )
    
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df_props['features'])
    
    # 2. Get user profile based on interactions
    user_interactions = [i for i in interactions_db if i['userId'] == user_id]
    
    if not user_interactions:
        # Cold start: return most popular or random
        return {"recommendations": df_props.head(limit)['id'].tolist(), "note": "Cold start"}
    
    # Get properties the user interacted with
    interacted_prop_ids = [i['propertyId'] for i in user_interactions]
    user_interacted_indices = df_props.index[df_props['id'].isin(interacted_prop_ids)].tolist()
    
    if not user_interacted_indices:
        return {"recommendations": df_props.head(limit)['id'].tolist()}

    # Average the tf-idf vectors of properties the user liked to create a user profile
    user_profile = tfidf_matrix[user_interacted_indices].mean(axis=0)
    
    # Calculate cosine similarity between user profile and all properties
    cosine_sim = cosine_similarity(user_profile, tfidf_matrix).flatten()
    
    # Get top N indices, excluding already interacted ones if desired
    # For now, just top N
    top_indices = cosine_sim.argsort()[-limit:][::-1]
    
    recommendations = df_props.iloc[top_indices]['id'].tolist()
    
    return {"recommendations": recommendations}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
