import asyncio
import httpx
import os
import json
from dotenv import load_dotenv

# Load .env from parent directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

API_KEY = os.getenv("FREEPIK_API_KEY")

async def test_response_structure():
    """Test to see exact structure of Freepik API response"""
    
    # Usa um task_id de uma requisição anterior do log
    task_id = "5e5a2eb6-6b9b-4f81-b78e-a2e1083bb507"
    
    url = f"https://api.freepik.com/v1/ai/mystic/{task_id}"
    headers = {"x-freepik-api-key": API_KEY}
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, headers=headers)
        data = response.json()
        
        print("=== FULL RESPONSE ===")
        print(json.dumps(data, indent=2))
        
        print("\n\n=== GENERATED ARRAY ===")
        generated = data["data"].get("generated", [])
        if generated:
            print(f"Length: {len(generated)}")
            print(f"First item: {json.dumps(generated[0], indent=2)}")
            
            # Check which property contains the URL
            first_item = generated[0]
            print(f"\n\n=== First generated item ===")
            print(f"Type: {type(first_item)}")
            print(f"Value: {first_item}")

if __name__ == "__main__":
    asyncio.run(test_response_structure())
