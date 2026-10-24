

import sys
import json
from extract_text import extract_certificate
from extract_details import extract_details


def main():
    if len(sys.argv) < 2:
        print("Error: Certificate file path was not provided", file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        text = extract_certificate(file_path)
        if not text or not text.strip():
            print("Error: No text could be extracted from the certificate", file=sys.stderr)
            sys.exit(1)

        details = extract_details(text)

        print("\n--- Extracted Certificate Details ---")
        print(json.dumps(details, indent=2, ensure_ascii=False))

    except Exception as error:
        print(f"Error: {error}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

