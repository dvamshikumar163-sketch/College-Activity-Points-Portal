

import json
import requests


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
        "http://127.0.0.1:11434/api/generate",
        json={
            "model": "llama3.2:3b",
            "prompt": prompt,
            "stream": False,
            "format": "json",
        },
        timeout=120,
    )

    response.raise_for_status()
    result = response.json()["response"]
    details = json.loads(result)

    for key, value in details.items():
        if isinstance(value, str) and value.strip().lower() in ("null", "none", ""):
            details[key] = None

    return details
    


if __name__ == "__main__":
    text = input("Paste certificate text to test AI extraction:\n")

    try:
        details = extract_details(text)
        print("\nExtracted certificate details:")
        print(json.dumps(details, indent=2))
    except requests.RequestException as error:
        print("Ollama connection failed:", error)
    except (json.JSONDecodeError, KeyError) as error:
        print("Could not parse the AI response:", error)

