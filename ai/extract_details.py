

import json
import os
import requests

OLLAMA_BASE_URL = os.getenv(
    "OLLAMA_BASE_URL",
    "http://127.0.0.1:11434"
).rstrip("/")

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")


def extract_details(text):
    prompt = f"""
Extract details from the certificate text below.

Return only a valid JSON object with exactly these keys:
student_name, certificate_title, organization, date.

Rules:
- student_name: Name of the person receiving the certificate.
- certificate_title: Extract the specific event or achievement name.
  Look for phrases after "for participating in", "completed", or
  "awarded for". Do not use generic headings like "Participation"
  when a specific event name is available.
- organization: Identify the issuing organization using only the text provided.
- date: Return the date if explicitly present.
- For any missing value, return JSON null (without quotation marks).
- Never invent information.

Certificate text:
{text}
"""

    response = requests.post(
        f"{OLLAMA_BASE_URL}/api/generate",
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
        },
        timeout=120,
    )

    response.raise_for_status()
    result = response.json()["response"]
    details = json.loads(result)

    required_keys = [
        "student_name",
        "certificate_title",
        "organization",
        "date",
    ]

    # Keep exactly the expected fields.
    details = {key: details.get(key) for key in required_keys}

    for key, value in details.items():
        if isinstance(value, str) and value.strip().lower() in (
            "null", "none", ""
        ):
            details[key] = None

    return details


if __name__ == "__main__":
    text = input("Paste certificate text to test AI extraction:\n")

    try:
        details = extract_details(text)
        print("\nExtracted certificate details:")
        print(json.dumps(details, indent=2, ensure_ascii=False))
    except requests.RequestException as error:
        print("Ollama connection failed:", error)
    except (json.JSONDecodeError, KeyError) as error:
        print("Could not parse the AI response:", error)

