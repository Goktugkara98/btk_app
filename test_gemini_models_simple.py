#!/usr/bin/env python3
"""
Simple Gemini Model Test Script
Test Gemini models with basic requests
"""

import os
import json
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SimpleGeminiTester:
    def __init__(self):
        self.api_key_1 = os.getenv('GEMINI_API_KEY')
        self.api_key_2 = os.getenv('GEMINI_API_KEY_2')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        
        # Popular models to test
        self.models_to_test = [
            "gemini-2.5-pro",
            "gemini-2.5-flash", 
            "gemini-2.5-flash-lite",
            "gemini-1.5-flash",
            "gemini-1.5-pro"
        ]
        
        # Test prompts
        self.test_prompts = [
            "Merhaba! Nasılsın?",
            "Python'da 'Hello World' nasıl yazılır?",
            "Türkiye'nin başkenti neresidir?",
            "2+2 kaç eder?"
        ]
    
    def test_model_with_prompt(self, model_name, prompt, api_key, key_name):
        """Test a specific model with a given prompt"""
        if not api_key:
            return {
                "status": "error",
                "message": "API key not set"
            }
        
        url = f"{self.base_url}/{model_name}:generateContent"
        headers = {
            "Content-Type": "application/json"
        }
        
        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
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
                response_data = response.json()
                candidates = response_data.get("candidates", [])
                
                if candidates:
                    content = candidates[0].get("content", {})
                    parts = content.get("parts", [])
                    
                    if parts:
                        text = parts[0].get("text", "No text in response")
                        return {
                            "status": "success",
                            "response_time": response.elapsed.total_seconds(),
                            "response": text,
                            "model_response": text[:200] + "..." if len(text) > 200 else text
                        }
                    else:
                        return {
                            "status": "error",
                            "message": "No text in response parts"
                        }
                else:
                    return {
                        "status": "error", 
                        "message": "No candidates in response"
                    }
            else:
                return {
                    "status": "error",
                    "message": f"HTTP {response.status_code}",
                    "error_details": response.text[:200] if response.text else "No error details"
                }
                
        except requests.exceptions.Timeout:
            return {
                "status": "error",
                "message": "Request timeout"
            }
        except requests.exceptions.RequestException as e:
            return {
                "status": "error",
                "message": f"Request failed: {str(e)}"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Unexpected error: {str(e)}"
            }
    
    def test_all_models(self):
        """Test all models with different prompts"""
        print("🚀 Testing Gemini Models with Simple Requests")
        print("=" * 70)
        
        # Test with API Key 1
        if self.api_key_1:
            print(f"\n🔑 Testing with API Key 1: {self.api_key_1[:10]}...")
            print("=" * 50)
            self.test_models_with_key(self.api_key_1, "API Key 1")
        
        # Test with API Key 2
        if self.api_key_2:
            print(f"\n🔑 Testing with API Key 2: {self.api_key_2[:10]}...")
            print("=" * 50)
            self.test_models_with_key(self.api_key_2, "API Key 2")
    
    def test_models_with_key(self, api_key, key_name):
        """Test all models with a specific API key"""
        for i, model in enumerate(self.models_to_test, 1):
            print(f"\n📋 Test {i}: {model}")
            print("-" * 40)
            
            # Test with first prompt
            prompt = self.test_prompts[0]
            print(f"Prompt: {prompt}")
            
            result = self.test_model_with_prompt(model, prompt, api_key, key_name)
            
            if result["status"] == "success":
                print(f"✅ SUCCESS ({result['response_time']:.2f}s)")
                print(f"Response: {result['model_response']}")
            else:
                print(f"❌ FAILED: {result['message']}")
    
    def interactive_test(self):
        """Interactive test mode"""
        print("\n🎮 INTERACTIVE TEST MODE")
        print("=" * 50)
        
        # Select API key
        if self.api_key_1 and self.api_key_2:
            print("Available API Keys:")
            print("1. API Key 1")
            print("2. API Key 2")
            choice = input("Select API key (1 or 2): ").strip()
            
            if choice == "1":
                api_key = self.api_key_1
                key_name = "API Key 1"
            elif choice == "2":
                api_key = self.api_key_2
                key_name = "API Key 2"
            else:
                print("Invalid choice, using API Key 1")
                api_key = self.api_key_1
                key_name = "API Key 1"
        else:
            api_key = self.api_key_1 or self.api_key_2
            key_name = "Available Key"
        
        if not api_key:
            print("❌ No API key available!")
            return
        
        # Select model
        print("\nAvailable Models:")
        for i, model in enumerate(self.models_to_test, 1):
            print(f"{i}. {model}")
        
        try:
            model_choice = int(input("Select model (1-5): ")) - 1
            if 0 <= model_choice < len(self.models_to_test):
                selected_model = self.models_to_test[model_choice]
            else:
                print("Invalid choice, using gemini-2.5-pro")
                selected_model = "gemini-2.5-pro"
        except ValueError:
            print("Invalid input, using gemini-2.5-pro")
            selected_model = "gemini-2.5-pro"
        
        print(f"\n🎯 Testing: {selected_model}")
        print("Type 'quit' to exit")
        
        while True:
            prompt = input("\nEnter your prompt: ").strip()
            
            if prompt.lower() == 'quit':
                break
            
            if not prompt:
                print("Please enter a prompt!")
                continue
            
            print("⏳ Processing...")
            result = self.test_model_with_prompt(selected_model, prompt, api_key, key_name)
            
            if result["status"] == "success":
                print(f"✅ Response ({result['response_time']:.2f}s):")
                print(f"📝 {result['response']}")
            else:
                print(f"❌ Error: {result['message']}")

def main():
    """Main function"""
    print("🤖 Simple Gemini Model Tester")
    print("=" * 50)
    
    # Check API keys
    api_key_1 = os.getenv('GEMINI_API_KEY')
    api_key_2 = os.getenv('GEMINI_API_KEY_2')
    
    if not api_key_1 and not api_key_2:
        print("❌ Error: No API keys found in .env file!")
        print("Please set GEMINI_API_KEY and/or GEMINI_API_KEY_2")
        return
    
    # Create tester
    tester = SimpleGeminiTester()
    
    # Run quick tests
    tester.test_all_models()
    
    # Ask for interactive mode
    print("\n" + "=" * 70)
    choice = input("Do you want to try interactive mode? (y/n): ").strip().lower()
    
    if choice in ['y', 'yes']:
        tester.interactive_test()
    
    print("\n🎉 Testing completed!")

if __name__ == "__main__":
    main() 