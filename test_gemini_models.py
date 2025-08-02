#!/usr/bin/env python3
"""
Gemini API Key Model Test Script
Tests both API keys with different Gemini models and saves results as JSON
"""

import os
import json
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiModelTester:
    def __init__(self):
        self.api_key_1 = os.getenv('GEMINI_API_KEY')
        self.api_key_2 = os.getenv('GEMINI_API_KEY_2')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        
        # Common Gemini models to test
        self.models = [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro-latest",
            "gemini-pro",
            "gemini-pro-vision"
        ]
        
        self.results = {
            "test_timestamp": datetime.now().isoformat(),
            "api_key_1": {
                "key": self.api_key_1[:10] + "..." if self.api_key_1 else "NOT_SET",
                "models": {}
            },
            "api_key_2": {
                "key": self.api_key_2[:10] + "..." if self.api_key_2 else "NOT_SET", 
                "models": {}
            }
        }
    
    def test_model_with_key(self, model_name, api_key, key_name):
        """Test a specific model with a given API key"""
        if not api_key:
            return {
                "status": "error",
                "message": "API key not set",
                "error_code": None
            }
        
        url = f"{self.base_url}/{model_name}:generateContent"
        headers = {
            "Content-Type": "application/json"
        }
        
        # Simple test prompt
        data = {
            "contents": [{
                "parts": [{
                    "text": "Hello! Please respond with 'Model test successful' if you can see this message."
                }]
            }]
        }
        
        try:
            response = requests.post(
                url,
                headers=headers,
                json=data,
                params={"key": api_key},
                timeout=30
            )
            
            if response.status_code == 200:
                return {
                    "status": "success",
                    "message": "Model working",
                    "response_time": response.elapsed.total_seconds(),
                    "model_response": response.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No text in response")
                }
            else:
                return {
                    "status": "error",
                    "message": f"HTTP {response.status_code}",
                    "error_code": response.status_code,
                    "error_details": response.text[:200] if response.text else "No error details"
                }
                
        except requests.exceptions.Timeout:
            return {
                "status": "error",
                "message": "Request timeout",
                "error_code": "TIMEOUT"
            }
        except requests.exceptions.RequestException as e:
            return {
                "status": "error",
                "message": f"Request failed: {str(e)}",
                "error_code": "REQUEST_ERROR"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Unexpected error: {str(e)}",
                "error_code": "UNEXPECTED_ERROR"
            }
    
    def test_all_models(self):
        """Test all models with both API keys"""
        print("🔍 Testing Gemini API Keys with different models...")
        print("=" * 60)
        
        for model in self.models:
            print(f"\n📋 Testing model: {model}")
            print("-" * 40)
            
            # Test with API Key 1
            print(f"🔑 Testing with API Key 1...")
            result_1 = self.test_model_with_key(model, self.api_key_1, "api_key_1")
            self.results["api_key_1"]["models"][model] = result_1
            
            if result_1["status"] == "success":
                print(f"✅ API Key 1 - {model}: SUCCESS ({result_1['response_time']:.2f}s)")
            else:
                print(f"❌ API Key 1 - {model}: FAILED - {result_1['message']}")
            
            # Test with API Key 2
            print(f"🔑 Testing with API Key 2...")
            result_2 = self.test_model_with_key(model, self.api_key_2, "api_key_2")
            self.results["api_key_2"]["models"][model] = result_2
            
            if result_2["status"] == "success":
                print(f"✅ API Key 2 - {model}: SUCCESS ({result_2['response_time']:.2f}s)")
            else:
                print(f"❌ API Key 2 - {model}: FAILED - {result_2['message']}")
    
    def save_results(self, filename="gemini_model_test_results.json"):
        """Save test results to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Results saved to: {filename}")
    
    def print_summary(self):
        """Print a summary of the test results"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        for key_name, key_data in [("API Key 1", self.results["api_key_1"]), ("API Key 2", self.results["api_key_2"])]:
            print(f"\n🔑 {key_name}: {key_data['key']}")
            
            working_models = []
            failed_models = []
            
            for model, result in key_data["models"].items():
                if result["status"] == "success":
                    working_models.append(model)
                else:
                    failed_models.append(model)
            
            print(f"✅ Working models ({len(working_models)}): {', '.join(working_models) if working_models else 'None'}")
            print(f"❌ Failed models ({len(failed_models)}): {', '.join(failed_models) if failed_models else 'None'}")

def main():
    """Main function to run the Gemini model tests"""
    print("🚀 Starting Gemini API Key Model Test")
    print("=" * 60)
    
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
    
    # Create tester and run tests
    tester = GeminiModelTester()
    tester.test_all_models()
    tester.print_summary()
    tester.save_results()
    
    print("\n🎉 Test completed!")

if __name__ == "__main__":
    main() 