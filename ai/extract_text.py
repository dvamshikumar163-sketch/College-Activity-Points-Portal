

import os
import sys
import pymupdf
import pytesseract
from PIL import Image, ImageOps
from io import BytesIO

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


def extract_from_image(image):
    image = ImageOps.exif_transpose(image)
    image = image.convert("L")
    text = pytesseract.image_to_string(image, lang="eng")
    return text.strip()


def extract_from_pdf(pdf_path):
    all_text = []

    with pymupdf.open(pdf_path) as document:
        for page_number, page in enumerate(document, start=1):
            text = page.get_text().strip()

            if not text:
                pix = page.get_pixmap(dpi=300, alpha=False)
                image = Image.open(BytesIO(pix.tobytes("png")))
                text = extract_from_image(image)

            all_text.append(f"\n--- Page {page_number} ---\n{text}")

    return "\n".join(all_text)


def extract_certificate(file_path):
    extension = os.path.splitext(file_path)[1].lower()

    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    if extension == ".pdf":
        return extract_from_pdf(file_path)

    if extension in (".jpg", ".jpeg", ".png"):
        with Image.open(file_path) as image:
            return extract_from_image(image)

    raise ValueError(
        "Unsupported file type. Use PDF, JPG, JPEG, or PNG."
    )


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: Certificate file path was not provided", file=sys.stderr)
        sys.exit(1)

    try:
        extracted_text = extract_certificate(sys.argv[1])
        print(extracted_text)

        if not extracted_text:
            print("No text was detected.", file=sys.stderr)
            sys.exit(1)

    except Exception as error:
        print(f"Error: {error}", file=sys.stderr)
        sys.exit(1)
