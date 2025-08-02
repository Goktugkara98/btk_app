#!/usr/bin/env python3
"""
Gemini API Models List Script
Uses Google's official ListModels API to show available models for each API key
"""

import os
import json
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiModelsLister:
    def __init__(self):
        self.api_key_1 = os.getenv('GEMINI_API_KEY')
        self.api_key_2 = os.getenv('GEMINI_API_KEY_2')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        
        self.results = {
            "list_timestamp": datetime.now().isoformat(),
            "api_key_1": {
                "key": self.api_key_1[:10] + "..." if self.api_key_1 else "NOT_SET",
                "models": [],
                "status": "not_tested"
            },
            "api_key_2": {
                "key": self.api_key_2[:10] + "..." if self.api_key_2 else "NOT_SET",
                "models": [],
                "status": "not_tested"
            }
        }
    
    def list_models_for_key(self, api_key, key_name):
        """List available models for a given API key using Google's ListModels API"""
        if not api_key:
            return {
                "status": "error",
                "message": "API key not set",
                "models": []
            }
        
        url = self.base_url
        headers = {
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.get(
                url,
                headers=headers,
                params={"key": api_key},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                models = data.get("models", [])
                
                # Filter only Gemini models and extract relevant info
                gemini_models = []
                for model in models:
                    model_name = model.get("name", "")
                    if "gemini" in model_name.lower():
                        gemini_models.append({
                            "name": model_name,
                            "display_name": model.get("displayName", ""),
                            "description": model.get("description", ""),
                            "supported_generation_methods": model.get("supportedGenerationMethods", []),
                            "version": model.get("version", "")
                        })
                
                return {
                    "status": "success",
                    "message": f"Found {len(gemini_models)} Gemini models",
                    "total_models": len(models),
                    "gemini_models": gemini_models,
                    "all_models": [model.get("name", "") for model in models]
                }
            else:
                return {
                    "status": "error",
                    "message": f"HTTP {response.status_code}",
                    "error_code": response.status_code,
                    "error_details": response.text[:200] if response.text else "No error details",
                    "models": []
                }
                
        except requests.exceptions.Timeout:
            return {
                "status": "error",
                "message": "Request timeout",
                "models": []
            }
        except requests.exceptions.RequestException as e:
            return {
                "status": "error",
                "message": f"Request failed: {str(e)}",
                "models": []
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Unexpected error: {str(e)}",
                "models": []
            }
    
    def list_all_models(self):
        """List models for both API keys"""
        print("🔍 Listing available Gemini models for both API keys...")
        print("=" * 70)
        
        # Test with API Key 1
        print(f"\n🔑 Testing API Key 1: {self.api_key_1[:10]}...")
        print("-" * 50)
        result_1 = self.list_models_for_key(self.api_key_1, "api_key_1")
        self.results["api_key_1"].update(result_1)
        
        if result_1["status"] == "success":
            print(f"✅ API Key 1: {result_1['message']}")
            print(f"📊 Total models available: {result_1['total_models']}")
            print(f"🤖 Gemini models found: {len(result_1['gemini_models'])}")
            
            for i, model in enumerate(result_1['gemini_models'], 1):
                print(f"  {i}. {model['name']}")
                print(f"     Display: {model['display_name']}")
                print(f"     Methods: {', '.join(model.get('supported_generation_methods', []))}")
                if model['description']:
                    print(f"     Description: {model['description'][:100]}...")
                print()
        else:
            print(f"❌ API Key 1: {result_1['message']}")
        
        # Test with API Key 2
        print(f"\n🔑 Testing API Key 2: {self.api_key_2[:10]}...")
        print("-" * 50)
        result_2 = self.list_models_for_key(self.api_key_2, "api_key_2")
        self.results["api_key_2"].update(result_2)
        
        if result_2["status"] == "success":
            print(f"✅ API Key 2: {result_2['message']}")
            print(f"📊 Total models available: {result_2['total_models']}")
            print(f"🤖 Gemini models found: {len(result_2['gemini_models'])}")
            
            for i, model in enumerate(result_2['gemini_models'], 1):
                print(f"  {i}. {model['name']}")
                print(f"     Display: {model['display_name']}")
                print(f"     Methods: {', '.join(model.get('supported_generation_methods', []))}")
                if model['description']:
                    print(f"     Description: {model['description'][:100]}...")
                print()
        else:
            print(f"❌ API Key 2: {result_2['message']}")
    
    def save_results(self, filename="gemini_models_list.json"):
        """Save results to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Results saved to: {filename}")
    
    def print_comparison(self):
        """Print comparison between the two API keys"""
        print("\n" + "=" * 70)
        print("📊 API KEY COMPARISON")
        print("=" * 70)
        
        key1_data = self.results["api_key_1"]
        key2_data = self.results["api_key_2"]
        
        print(f"\n🔑 API Key 1: {key1_data['key']}")
        print(f"   Status: {key1_data['status']}")
        if key1_data['status'] == 'success':
            print(f"   Gemini Models: {len(key1_data['gemini_models'])}")
            print(f"   Total Models: {key1_data['total_models']}")
        
        print(f"\n🔑 API Key 2: {key2_data['key']}")
        print(f"   Status: {key2_data['status']}")
        if key2_data['status'] == 'success':
            print(f"   Gemini Models: {len(key2_data['gemini_models'])}")
            print(f"   Total Models: {key2_data['total_models']}")
        
        # Compare available models
        if key1_data['status'] == 'success' and key2_data['status'] == 'success':
            key1_models = set(model['name'] for model in key1_data['gemini_models'])
            key2_models = set(model['name'] for model in key2_data['gemini_models'])
            
            common_models = key1_models.intersection(key2_models)
            key1_only = key1_models - key2_models
            key2_only = key2_models - key1_models
            
            print(f"\n🤝 Common models ({len(common_models)}): {', '.join(sorted(common_models)) if common_models else 'None'}")
            print(f"🔑 Key 1 only ({len(key1_only)}): {', '.join(sorted(key1_only)) if key1_only else 'None'}")
            print(f"🔑 Key 2 only ({len(key2_only)}): {', '.join(sorted(key2_only)) if key2_only else 'None'}")

def main():
    """Main function to list Gemini models"""
    print("🚀 Starting Gemini Models List")
    print("=" * 70)
    
    # Check if API keys are set
    api_key_1 = os.getenv('GEMINI_API_KEY')
    api_key_2 = os.getenv('GEMINI_API_KEY_2')
    
    if not api_key_1 and not api_key_2:
        print("❌ Error: No API keys found in .env file!")
        print("Please set GEMINI_API_KEY and/or GEMINI_API_KEY_2 in your .env file")
        return
    
    if not api_key_1:
        print("⚠️  Warning: GEMINI_API_KEY not set")
    else:
        print(f"✅ GEMINI_API_KEY found: {api_key_1[:10]}...")
    
    if not api_key_2:
        print("⚠️  Warning: GEMINI_API_KEY_2 not set")
    else:
        print(f"✅ GEMINI_API_KEY_2 found: {api_key_2[:10]}...")
    
    # Create lister and run
    lister = GeminiModelsLister()
    lister.list_all_models()
    lister.print_comparison()
    lister.save_results()
    
    print("\n🎉 Model listing completed!")

if __name__ == "__main__":
    main() 