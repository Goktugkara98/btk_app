#!/usr/bin/env python3
"""
Filter Gemini 2.5 Models Script
Filters and lists only the latest Gemini 2.5 models from the JSON data
"""

import json
import re
from datetime import datetime

def load_models_data(filename="gemini_models_list.json"):
    """Load the models data from JSON file"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: {filename} not found!")
        return None
    except json.JSONDecodeError:
        print(f"❌ Error: Invalid JSON in {filename}")
        return None

def filter_gemini_25_models(models_data):
    """Filter only Gemini 2.5 models"""
    if not models_data:
        return []
    
    # Get models from the first API key (they should be the same for both)
    api_key_1_data = models_data.get("api_key_1", {})
    if api_key_1_data.get("status") != "success":
        print("❌ Error: API key 1 data not available")
        return []
    
    all_models = api_key_1_data.get("gemini_models", [])
    
    # Filter for Gemini 2.5 models
    gemini_25_models = []
    for model in all_models:
        model_name = model.get("name", "")
        display_name = model.get("display_name", "")
        
        # Check if it's a Gemini 2.5 model
        if "2.5" in model_name or "2.5" in display_name:
            gemini_25_models.append(model)
    
    return gemini_25_models

def categorize_models(models):
    """Categorize models by type and stability"""
    categories = {
        "stable": [],
        "preview": [],
        "experimental": [],
        "latest": []
    }
    
    for model in models:
        model_name = model.get("name", "")
        display_name = model.get("display_name", "")
        
        # Determine category
        if "latest" in model_name.lower():
            categories["latest"].append(model)
        elif "preview" in model_name.lower() or "preview" in display_name.lower():
            categories["preview"].append(model)
        elif "exp" in model_name.lower() or "experimental" in display_name.lower():
            categories["experimental"].append(model)
        else:
            categories["stable"].append(model)
    
    return categories

def print_model_info(model, index):
    """Print detailed model information"""
    print(f"  {index}. {model['name']}")
    print(f"     Display: {model['display_name']}")
    print(f"     Methods: {', '.join(model.get('supported_generation_methods', []))}")
    if model.get('version'):
        print(f"     Version: {model['version']}")
    if model.get('description'):
        desc = model['description']
        if len(desc) > 120:
            desc = desc[:120] + "..."
        print(f"     Description: {desc}")
    print()

def main():
    """Main function to filter and display Gemini 2.5 models"""
    print("🔍 Filtering Gemini 2.5 Models")
    print("=" * 60)
    
    # Load data
    models_data = load_models_data()
    if not models_data:
        return
    
    # Filter Gemini 2.5 models
    gemini_25_models = filter_gemini_25_models(models_data)
    
    if not gemini_25_models:
        print("❌ No Gemini 2.5 models found!")
        return
    
    print(f"✅ Found {len(gemini_25_models)} Gemini 2.5 models")
    print()
    
    # Categorize models
    categories = categorize_models(gemini_25_models)
    
    # Print Stable Models
    if categories["stable"]:
        print("🟢 STABLE MODELS (Production Ready)")
        print("-" * 40)
        for i, model in enumerate(categories["stable"], 1):
            print_model_info(model, i)
    
    # Print Latest Models
    if categories["latest"]:
        print("🟡 LATEST MODELS (Most Recent)")
        print("-" * 40)
        for i, model in enumerate(categories["latest"], 1):
            print_model_info(model, i)
    
    # Print Preview Models
    if categories["preview"]:
        print("🟠 PREVIEW MODELS (Beta/Preview)")
        print("-" * 40)
        for i, model in enumerate(categories["preview"], 1):
            print_model_info(model, i)
    
    # Print Experimental Models
    if categories["experimental"]:
        print("🔴 EXPERIMENTAL MODELS (Testing)")
        print("-" * 40)
        for i, model in enumerate(categories["experimental"], 1):
            print_model_info(model, i)
    
    # Summary
    print("=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"🟢 Stable: {len(categories['stable'])}")
    print(f"🟡 Latest: {len(categories['latest'])}")
    print(f"🟠 Preview: {len(categories['preview'])}")
    print(f"🔴 Experimental: {len(categories['experimental'])}")
    print(f"📈 Total Gemini 2.5 Models: {len(gemini_25_models)}")
    
    # Recommendations
    print("\n💡 RECOMMENDATIONS")
    print("=" * 60)
    if categories["stable"]:
        print("✅ For Production: Use stable models")
        for model in categories["stable"]:
            print(f"   - {model['name']}")
    
    if categories["latest"]:
        print("\n🚀 For Latest Features: Use latest models")
        for model in categories["latest"]:
            print(f"   - {model['name']}")
    
    if categories["preview"]:
        print("\n🔬 For Testing New Features: Use preview models")
        for model in categories["preview"]:
            print(f"   - {model['name']}")

if __name__ == "__main__":
    main() 