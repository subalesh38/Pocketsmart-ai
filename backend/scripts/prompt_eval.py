"""
PocketSmart AI - Prompt Evaluation Script
Tests real Gemini API against realistic scenarios for Home, Party, and Jewelry planners.

Usage:
    cd backend
    python -m scripts.prompt_eval
    # or with uv:
    uv run --with-requirements requirements.txt python -m scripts.prompt_eval
"""

import sys
import os
import time
import json
from pathlib import Path

# Ensure backend directory is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.services.planner_service import run_planner
from app.services.gemini_client import generate_json
from app.schemas.ai_output import AIHomeResult, AIPartyResult, AIJewelryResult
from app.services.prompts import home as home_prompt, party as party_prompt, jewelry as jewelry_prompt
from app.core.config import settings

HOME_TEST_CASES = [
    {"total_budget": 50000, "rooms": 1, "lights": 4, "fans": 2, "furniture": 2, "dining_tables": 0, "notes": "Compact 1BHK rental setup with modern warm lighting."},
    {"total_budget": 150000, "rooms": 2, "lights": 8, "fans": 3, "furniture": 5, "dining_tables": 1, "notes": "2BHK family home in Bangalore, need durable wooden finish furniture."},
    {"total_budget": 350000, "rooms": 3, "lights": 14, "fans": 4, "furniture": 8, "dining_tables": 1, "notes": "3BHK modern aesthetic, smart lighting and comfortable sofas."},
    {"total_budget": 80000, "rooms": 1, "lights": 6, "fans": 1, "furniture": 3, "dining_tables": 0, "notes": "Home studio and workspace setup for a software engineer."},
    {"total_budget": 200000, "rooms": 2, "lights": 10, "fans": 4, "furniture": 6, "dining_tables": 1, "notes": "Scandinavian minimal vibe with neutral tones."},
    {"total_budget": 500000, "rooms": 4, "lights": 20, "fans": 6, "furniture": 12, "dining_tables": 1, "notes": "Luxury 4BHK apartment interior essentials."},
    {"total_budget": 30000, "rooms": 1, "lights": 2, "fans": 1, "furniture": 1, "dining_tables": 0, "notes": "Budget bachelor pad essentials only."},
    {"total_budget": 120000, "rooms": 2, "lights": 6, "fans": 2, "furniture": 4, "dining_tables": 1, "notes": "Eco-friendly, energy-efficient appliances and bamboo furniture."},
]

PARTY_TEST_CASES = [
    {"total_budget": 25000, "guests": 15, "event_type": "birthday", "venue_type": "home", "needs": ["catering", "decor", "entertainment"], "notes": "10th birthday party with superhero theme and snack boxes."},
    {"total_budget": 75000, "guests": 50, "event_type": "anniversary", "venue_type": "banquet", "needs": ["catering", "decor", "entertainment"], "notes": "Silver jubilee anniversary dinner for close family and friends."},
    {"total_budget": 200000, "guests": 100, "event_type": "wedding", "venue_type": "lawn", "needs": ["catering", "decor", "entertainment"], "notes": "Haldi and Mehendi day event with vibrant marigold decor."},
    {"total_budget": 45000, "guests": 25, "event_type": "corporate", "venue_type": "restaurant", "needs": ["catering", "entertainment"], "notes": "Team quarterly success celebration dinner."},
    {"total_budget": 30000, "guests": 20, "event_type": "other", "venue_type": "terrace", "needs": ["catering", "decor", "entertainment"], "notes": "Housewarming get-together with light finger food and acoustic music."},
    {"total_budget": 120000, "guests": 80, "event_type": "birthday", "venue_type": "clubhouse", "needs": ["catering", "decor", "entertainment"], "notes": "50th milestone birthday gala with buffet dinner and DJ."},
    {"total_budget": 15000, "guests": 10, "event_type": "other", "venue_type": "home", "needs": ["catering"], "notes": "Casual board game night with pizza and drinks."},
    {"total_budget": 300000, "guests": 150, "event_type": "wedding", "venue_type": "resort", "needs": ["catering", "decor", "entertainment"], "notes": "Grand sangeet night with dance stage, sound system and live chaat counters."},
]

JEWELRY_TEST_CASES = [
    {"total_budget": 40000, "occasion": "wedding", "style": "traditional", "notes": "Traditional South Indian silk saree in maroon and gold."},
    {"total_budget": 15000, "occasion": "cocktail", "style": "contemporary", "notes": "Black evening gown, looking for elegant silver and cubic zirconia studs or pendant."},
    {"total_budget": 8000, "occasion": "daily_wear", "style": "minimalist", "notes": "Office daily wear lightweight rose gold earrings and simple chain."},
    {"total_budget": 60000, "occasion": "festive", "style": "ethnic", "notes": "Diwali family gathering with royal blue lehenga, gold/kundan set."},
    {"total_budget": 100000, "occasion": "bridal", "style": "traditional", "notes": "Bridal temple jewelry set including choker, maang tikka and jhumkas."},
    {"total_budget": 12000, "occasion": "party", "style": "bohemian", "notes": "Fusion ethnic crop top and skirt, oxidised silver jewelry with turquoise accents."},
    {"total_budget": 25000, "occasion": "engagement", "style": "modern", "notes": "Pastel pink gown for ring ceremony, delicate floral motif necklace."},
    {"total_budget": 50000, "occasion": "reception", "style": "glamorous", "notes": "Emerald green velvet lehenga with polki or emerald-accented jewelry."},
]

def evaluate_scenario(planner_type: str, test_case: dict, schema_class, prompt_fn) -> dict:
    prompt = prompt_fn(test_case)
    start_time = time.time()
    
    raw_json = None
    json_valid = False
    within_budget = False
    used_fallback = False
    
    try:
        raw_json = generate_json(prompt)
        latency = round(time.time() - start_time, 2)
        parsed = json.loads(raw_json)
        schema_class(**parsed)
        json_valid = True
    except Exception as e:
        latency = round(time.time() - start_time, 2)
        json_valid = False

    try:
        plan_result = run_planner(planner_type, test_case)
        if any("sample" in w.lower() or "failed" in w.lower() for w in plan_result.warnings):
            used_fallback = True
        
        target_budget = test_case.get("total_budget", 0)
        within_budget = plan_result.allocated <= target_budget
    except Exception as e:
        used_fallback = True

    return {
        "planner": planner_type,
        "latency_sec": latency,
        "json_valid": json_valid,
        "within_budget": within_budget,
        "used_fallback": used_fallback
    }

def run_prompt_eval():
    print("=" * 70)
    print(" PocketSmart AI - Prompt Quality & Latency Benchmark")
    print(f" Gemini Model: {settings.GEMINI_MODEL}")
    print(f" Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)

    if not settings.GEMINI_API_KEY:
        print("\n[WARNING] GEMINI_API_KEY is not configured in backend/.env.")
        print("Set your GEMINI_API_KEY in backend/.env to run against the live API.\n")
        return

    all_results = []

    planners = [
        ("home", HOME_TEST_CASES, AIHomeResult, home_prompt.build_prompt),
        ("party", PARTY_TEST_CASES, AIPartyResult, party_prompt.build_prompt),
        ("jewelry", JEWELRY_TEST_CASES, AIJewelryResult, jewelry_prompt.build_prompt),
    ]

    for name, cases, schema, prompt_fn in planners:
        print(f"\nEvaluating Planner: {name.upper()} ({len(cases)} test cases)...")
        for idx, case in enumerate(cases, 1):
            print(f"  [{idx}/{len(cases)}] Budget: ₹{case.get('total_budget'):,} ... ", end="", flush=True)
            res = evaluate_scenario(name, case, schema, prompt_fn)
            all_results.append(res)
            status = "OK" if res["json_valid"] and res["within_budget"] and not res["used_fallback"] else "WARN"
            print(f"{status} (Latency: {res['latency_sec']}s, Valid JSON: {res['json_valid']}, Within Budget: {res['within_budget']}, Fallback: {res['used_fallback']})")

    # Aggregate Summary
    print("\n" + "=" * 70)
    print(" BENCHMARK SUMMARY")
    print("=" * 70)
    print(f"{'Planner':<12} | {'Runs':<6} | {'Valid JSON':<12} | {'Within Budget':<14} | {'Fallback Rate':<14} | {'Avg Latency':<12}")
    print("-" * 70)

    for p_name in ["home", "party", "jewelry"]:
        p_res = [r for r in all_results if r["planner"] == p_name]
        total = len(p_res)
        valid_json_pct = (sum(1 for r in p_res if r["json_valid"]) / total) * 100 if total else 0
        within_budget_pct = (sum(1 for r in p_res if r["within_budget"]) / total) * 100 if total else 0
        fallback_pct = (sum(1 for r in p_res if r["used_fallback"]) / total) * 100 if total else 0
        avg_latency = sum(r["latency_sec"] for r in p_res) / total if total else 0

        print(f"{p_name.capitalize():<12} | {total:<6} | {valid_json_pct:>10.1f}% | {within_budget_pct:>12.1f}% | {fallback_pct:>12.1f}% | {avg_latency:>10.2f}s")

    total_all = len(all_results)
    if total_all:
        tot_json = (sum(1 for r in all_results if r["json_valid"]) / total_all) * 100
        tot_budget = (sum(1 for r in all_results if r["within_budget"]) / total_all) * 100
        tot_fb = (sum(1 for r in all_results if r["used_fallback"]) / total_all) * 100
        tot_lat = sum(r["latency_sec"] for r in all_results) / total_all
        print("-" * 70)
        print(f"{'OVERALL':<12} | {total_all:<6} | {tot_json:>10.1f}% | {tot_budget:>12.1f}% | {tot_fb:>12.1f}% | {tot_lat:>10.2f}s")
    print("=" * 70)

if __name__ == "__main__":
    run_prompt_eval()
