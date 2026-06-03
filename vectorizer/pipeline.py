import json
import time
import hashlib
import datetime
import requests
from prompts import STEP_1_SYSTEM_PROMPT, STEP_1_PROMPT, STEP_2_SYSTEM_PROMPT, STEP_2_PROMPT

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

DOMAIN_ITEM_COUNTS = {
    0: 18,  # Domain 1
    1: 17,  # Domain 2
    2: 8,   # Domain 3
    3: 18,  # Domain 4
    4: 6,   # Domain 5
    5: 6,   # Domain 6
    6: 21,  # Domain 7
    7: 18,  # Domain 8
    8: 6,   # Domain 9
    9: 27   # Domain 10
}

class QuotaExhaustedError(Exception):
    """Exception raised when the Gemini API key daily quota/billing limit is hit."""
    pass

def call_gemini_api(system_prompt, user_prompt, api_key, model="gemini-flash-latest", temperature=0.2):
    url = API_URL.format(model=model, api_key=api_key)
    headers = {"Content-Type": "application/json"}
    
    payload = {
        "contents": [
            {
                "parts": [{"text": user_prompt}]
            }
        ],
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": temperature
        }
    }
    
    # Simple retry logic with exponential backoff
    for attempt in range(6):  # Increase to 6 attempts to allow longer backoff
        try:
            r = requests.post(url, headers=headers, json=payload, timeout=60)
            if r.status_code == 200:
                resp_json = r.json()
                text = resp_json["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text.strip())
            elif r.status_code == 429:
                resp_text = r.text
                if "billing details" in resp_text or "check your plan" in resp_text or "GenerateRequestsPerDay" in resp_text:
                    print("Fatal: Gemini API Quota Exhausted. Aborting script.")
                    raise QuotaExhaustedError(f"Gemini API Quota Exhausted: {resp_text}")
                
                sleep_time = 30 + (2 ** attempt) * 5
                print(f"API Rate limit hit (429). Retrying in {sleep_time}s...")
                time.sleep(sleep_time)
            elif r.status_code == 503:
                sleep_time = 5 + attempt * 5
                print(f"Service Unavailable (503). Retrying in {sleep_time}s...")
                time.sleep(sleep_time)
            else:
                print(f"API returned error status {r.status_code}: {r.text}")
                time.sleep(5)
        except QuotaExhaustedError:
            raise
        except Exception as e:
            print(f"Request failed: {e}")
            time.sleep(5)
            
    raise Exception("Failed to call Gemini API after 6 attempts.")

def validate_vector_schema(vector, is_step2=False):
    # Basic structures
    if not isinstance(vector, dict):
        raise ValueError("Vector must be a JSON object.")
        
    meta = vector.get("meta")
    core_values = vector.get("core_values")
    conflict_resolution = vector.get("conflict_resolution")
    contextual_shifts = vector.get("contextual_shifts")
    
    if not (meta and core_values and isinstance(conflict_resolution, list) and isinstance(contextual_shifts, dict)):
        raise ValueError("Missing core keys in JSON output.")
        
    # Check domains
    domains = core_values.get("domains")
    if not isinstance(domains, list) or len(domains) != 10:
        raise ValueError("core_values.domains must be a list of exactly 10 values.")
        
    # Check gl_cs metadata
    gl_cs = meta.get("gl_cs")
    if not isinstance(gl_cs, list) or len(gl_cs) != 10:
        raise ValueError("meta.gl_cs must be a list of exactly 10 pairs.")
    for idx, pair in enumerate(gl_cs):
        if not isinstance(pair, list) or len(pair) != 2:
            raise ValueError(f"meta.gl_cs[{idx}] must be a pair [grounding, confidence].")
            
    # Check conflicts
    if len(conflict_resolution) != 36:
        raise ValueError(f"conflict_resolution must contain exactly 36 elements (got {len(conflict_resolution)}).")
        
    # Check shifts
    for ctx in ["work", "family", "private", "crisis"]:
        shifts = contextual_shifts.get(ctx)
        if not isinstance(shifts, list) or len(shifts) != 10:
            raise ValueError(f"contextual_shifts.{ctx} must be a list of exactly 10 values.")
            
    # Check items (if Step 2)
    if is_step2:
        items = core_values.get("items")
        if not isinstance(items, list) or len(items) != 10:
            raise ValueError("core_values.items must be a list of exactly 10 elements in Step 2.")
        for idx, item_list in enumerate(items):
            expected_count = DOMAIN_ITEM_COUNTS[idx]
            
            # Grounding check for null propagation
            d_val = domains[idx]
            gl, cs = gl_cs[idx]
            
            if d_val is None or gl < 25:
                if item_list is not None:
                    # Allow a list of nulls or direct null
                    if isinstance(item_list, list):
                        if not all(x is None for x in item_list):
                            raise ValueError(f"Domain {idx+1} is null but has non-null items: {item_list}")
                    else:
                        raise ValueError(f"Domain {idx+1} is null, expected items list to be null or list of nulls.")
            else:
                if not isinstance(item_list, list) or len(item_list) != expected_count:
                    raise ValueError(f"Domain {idx+1} items must be a list of exactly {expected_count} values (got {item_list}).")

def run_vectorization_pipeline(uid, narrative, api_key, model="gemini-flash-latest"):
    print(f"[{uid}] Starting Step 1: Domain Discovery...")
    sha1 = hashlib.sha1(narrative.encode('utf-8')).hexdigest()
    
    # 1. Step 1: Domain Discovery
    user_prompt_1 = STEP_1_PROMPT.format(uid=uid, narrative=narrative)
    step1_result = call_gemini_api(
        system_prompt=STEP_1_SYSTEM_PROMPT,
        user_prompt=user_prompt_1,
        api_key=api_key,
        model=model,
        temperature=0.2
    )
    
    # Set/Fix baseline metadata
    if "meta" not in step1_result:
        step1_result["meta"] = {}
    step1_result["meta"]["vector_id"] = f"uid_{uid}_1"
    step1_result["meta"]["uid"] = int(uid)
    step1_result["meta"]["timestamp"] = datetime.datetime.utcnow().isoformat() + "Z"
    step1_result["meta"]["version"] = "1.0"
    step1_result["meta"]["hash"] = sha1
    
    # Calculate overall confidence
    gl_cs = step1_result["meta"].get("gl_cs", [])
    if isinstance(gl_cs, list) and len(gl_cs) == 10:
        confidences = [pair[1] for pair in gl_cs if isinstance(pair, list) and len(pair) == 2]
        if confidences:
            step1_result["meta"]["overall_confidence"] = round(sum(confidences) / len(confidences), 1)
            
    # Validate Step 1 Schema
    validate_vector_schema(step1_result, is_step2=False)
    print(f"[{uid}] Step 1 validated successfully. Overall Confidence: {step1_result['meta']['overall_confidence']}")
    
    # 2. Step 2: Item Evaluation
    print(f"[{uid}] Starting Step 2: Item Evaluation...")
    # Add a short delay between steps to prevent burst limits
    time.sleep(1.0)
    
    # Check if we need nuance evaluations
    domains = step1_result["core_values"]["domains"]
    gl_cs = step1_result["meta"]["gl_cs"]
    
    # Construct prompt for step 2
    step1_json_str = json.dumps(step1_result, indent=2)
    user_prompt_2 = STEP_2_PROMPT.format(step1_json=step1_json_str, narrative=narrative)
    
    step2_result = call_gemini_api(
        system_prompt=STEP_2_SYSTEM_PROMPT,
        user_prompt=user_prompt_2,
        api_key=api_key,
        model=model,
        temperature=0.3
    )
    
    # Propagate baseline metadata from Step 1
    step2_result["meta"]["vector_id"] = f"uid_{uid}_1"
    step2_result["meta"]["uid"] = int(uid)
    step2_result["meta"]["timestamp"] = datetime.datetime.utcnow().isoformat() + "Z"
    step2_result["meta"]["version"] = "2.1"
    step2_result["meta"]["hash"] = sha1
    step2_result["meta"]["gl_cs"] = gl_cs
    
    # Recalculate confidence
    confidences = [pair[1] for pair in gl_cs]
    if confidences:
        step2_result["meta"]["overall_confidence"] = round(sum(confidences) / len(confidences), 1)
        
    # Validate Step 2 Schema
    validate_vector_schema(step2_result, is_step2=True)
    print(f"[{uid}] Step 2 validated and completed successfully.")
    
    return step2_result
