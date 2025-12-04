import asyncio
import httpx
import os
import json
import time
from dotenv import load_dotenv

# Load environment variables from parent directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

API_KEY = os.getenv("FREEPIK_API_KEY")

if not API_KEY:
    print("❌ Error: FREEPIK_API_KEY not found in .env")
    exit(1)

async def test_freepik():
    print(f"🔑 Testing with API Key: {API_KEY[:5]}...{API_KEY[-5:]}")
    
    url = "https://api.freepik.com/v1/ai/mystic"
    headers = {
        "Content-Type": "application/json",
        "x-freepik-api-key": API_KEY
    }
    
    payload = {
        "prompt": "a futuristic city with flying cars, cyberpunk style",
        "model": "fluid",
        "aspect_ratio": "square_1_1",
        "resolution": "1k",
        # "engine": "automatic", # Commenting out to test if this is the issue
        "filter_nsfw": True
    }
    
    print("\n🚀 Sending POST request to generate image...")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, headers=headers, json=payload)
            print(f"📥 Response Status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"❌ Error Response: {response.text}")
                return
                
            data = response.json()
            print(f"✅ Response Data: {json.dumps(data, indent=2)}")
            
            task_id = data["data"]["task_id"]
            print(f"\n🆔 Task ID: {task_id}")
            
            # Polling
            print("\n⏳ Starting polling...")
            for i in range(10):
                await asyncio.sleep(2)
                status_url = f"{url}/{task_id}"
                print(f"Checking status ({i+1}/10)...")
                
                status_response = await client.get(status_url, headers=headers)
                status_data = status_response.json()
                
                status = status_data["data"]["status"]
                print(f"Status: {status}")
                
                if status == "completed":
                    print("\n🎉 Generation Completed!")
                    print(f"Image URL: {status_data['data']['generated'][0]['url']}")
                    break
                elif status == "failed":
                    print("\n❌ Generation Failed!")
                    break
                    
        except Exception as e:
            print(f"\n❌ Exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_freepik())
