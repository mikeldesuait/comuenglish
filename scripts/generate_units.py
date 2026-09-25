#!/usr/bin/env python3
"""
Generate complete Cambridge units with grammar, vocabulary and exercises.
Calls DeepSeek API for each unit and saves the result.
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error

# CONFIGURATION
API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
API_URL = "https://api.deepseek.com/chat/completions"
MODEL = "deepseek-chat"
BASE_DIR = os.path.expanduser("~/cambridge-prep")

if not API_KEY:
    print("ERROR: Set DEEPSEEK_API_KEY environment variable first")
    print("Example: export DEEPSEEK_API_KEY='sk-xxxxx'")
    sys.exit(1)


def build_prompt(level, unit):
    """Build the prompt for one unit."""
    return f"""Generate a complete grammar unit for Cambridge {level.upper()} English exam preparation.

Unit topic: {unit['title']}
Unit ID: {unit['id']}

Return ONLY valid JSON (no markdown, no code fences, no explanation, no comments):

{{
  "id": "{unit['id']}",
  "title": "{unit['title']}",
  "grammar": "... (grammar focus)",
  "vocabulary": "... (vocabulary focus)",
  "function": "... (communicative function)",
  "phases": [
    {{
      "name": "Grammar explanation",
      "type": "theory",
      "content": "... (200-300 words explanation in simple English, with conjugation tables written as plain text and 6-8 examples. Include: when to use it, how to form it, common mistakes)"
    }},
    {{
      "name": "Vocabulary",
      "type": "vocab",
      "content": "... (20-25 words in the topic, organized by subcategories, each with a short example sentence)"
    }},
    {{
      "name": "Discovery",
      "type": "text",
      "content": "... (6 example sentences showing the pattern, then a guiding question for the student to deduce the rule)"
    }},
    {{
      "name": "Guided practice",
      "type": "exercise",
      "questions": [
        {{"prompt": "...", "options": ["A","B","C","D"], "correct": 0, "explanation": "..."}}
      ]
    }},
    {{
      "name": "Free practice",
      "type": "task",
      "prompts": ["...", "...", "..."]
    }},
    {{
      "name": "Mini-test",
      "type": "exercise",
      "questions": [
        {{"prompt": "...", "options": ["A","B","C","D"], "correct": 0, "explanation": "..."}}
      ]
    }},
    {{
      "name": "Summary",
      "type": "theory",
      "content": "... (one-page cheat sheet: key rules, common mistakes, useful phrases. 100-150 words)"
    }}
  ]
}}

Requirements:
- Level: {level.upper()}
- 10 questions in "Guided practice" (focused on the grammar)
- 3 prompts in "Free practice" (production tasks)
- 10 questions in "Mini-test" (mixing this unit with previous topics)
- Vary the correct answer index across 0, 1, 2, 3 (do NOT always use the same position)
- Explanations must be brief and reference the rule
- All content in English, simple and clear
- No markdown in JSON strings, use plain text
"""


def call_deepseek(prompt, max_retries=3):
    """Call DeepSeek API and return the response content."""
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "You are an expert Cambridge English exam content generator. You always reply with valid JSON only, no markdown."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 8000,
        "response_format": {"type": "json_object"}
    }

    data = json.dumps(payload).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(API_URL, data=data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=180) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                return result["choices"][0]["message"]["content"]
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            print(f"  HTTP error {e.code}: {err_body[:200]}")
            if e.code == 429:
                wait = 30 * (attempt + 1)
                print(f"  Rate limited. Waiting {wait}s...")
                time.sleep(wait)
            else:
                time.sleep(5)
        except Exception as e:
            print(f"  Error: {e}")
            time.sleep(5)
    return None


def balance_answers(data):
    """Balance correct answers across positions."""
    import random
    random.seed(42)
    questions = []
    for phase in data.get("phases", []):
        if phase.get("type") == "exercise":
            for q in phase.get("questions", []):
                if "options" in q and "correct" in q:
                    questions.append(q)
    n = len(questions)
    if n == 0:
        return data
    # Group by number of options
    from collections import defaultdict
    by_count = defaultdict(list)
    for q in questions:
        by_count[len(q["options"])].append(q)
    for count, qs in by_count.items():
        targets = [len(qs) // count] * count
        for i in range(len(qs) % count):
            targets[i] += 1
        positions = []
        for i, c in enumerate(targets):
            positions.extend([i] * c)
        random.shuffle(positions)
        for q in qs:
            opts = q["options"]
            correct_idx = q["correct"]
            if correct_idx < 0 or correct_idx >= len(opts):
                positions.pop()
                continue
            correct_value = opts[correct_idx]
            target = positions.pop()
            others = [o for i, o in enumerate(opts) if i != correct_idx]
            random.shuffle(others)
            new_opts = []
            oi = 0
            for i in range(len(opts)):
                if i == target:
                    new_opts.append(correct_value)
                else:
                    new_opts.append(others[oi])
                    oi += 1
            q["options"] = new_opts
            q["correct"] = target
    return data


def main():
    levels = ["a2", "b1", "b2"]
    total = 0
    generated = 0

    for level in levels:
        units_path = os.path.join(BASE_DIR, "data", level, "units.json")
        if not os.path.exists(units_path):
            print(f"SKIP: {units_path} not found")
            continue
        with open(units_path) as f:
            units_data = json.load(f)
        units = units_data.get("units", [])
        total += len(units)

        print(f"\n=== Level {level.upper()}: {len(units)} units ===")
        for unit in units:
            uid = unit["id"]
            out_path = os.path.join(BASE_DIR, "data", level, f"{uid}.json")
            backup_path = out_path + ".pre-gen.bak"

            print(f"\n[{uid}] {unit['title']}")

            # Backup
            if os.path.exists(out_path) and not os.path.exists(backup_path):
                os.rename(out_path, backup_path)
                print(f"  Backup: {backup_path}")

            prompt = build_prompt(level, unit)
            response = call_deepseek(prompt)

            if not response:
                print(f"  FAILED to generate {uid}")
                continue

            try:
                data = json.loads(response)
            except json.JSONDecodeError as e:
                print(f"  JSON error: {e}")
                # Try to clean markdown fences
                cleaned = response.strip()
                if cleaned.startswith("```"):
                    cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned
                    cleaned = cleaned.rsplit("```", 1)[0]
                try:
                    data = json.loads(cleaned)
                except:
                    print(f"  Could not parse. Saving raw to /tmp/{uid}.raw")
                    with open(f"/tmp/{uid}.raw", "w") as f:
                        f.write(response)
                    continue

            data = balance_answers(data)

            with open(out_path, "w") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            # Count questions
            n_q = sum(len(p.get("questions", [])) for p in data.get("phases", []) if p.get("type") == "exercise")
            print(f"  OK: {n_q} questions")
            generated += 1

            time.sleep(2)  # avoid rate limit

    print(f"\n=== DONE ===")
    print(f"Generated: {generated}/{total} units")


if __name__ == "__main__":
    main()
