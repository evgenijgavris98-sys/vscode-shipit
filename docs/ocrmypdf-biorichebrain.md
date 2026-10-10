# OCRmyPDF for BIORICHEBRAIN

## Official sources
- Project: https://github.com/ocrmypdf/OCRmyPDF
- Installation guide: https://ocrmypdf.readthedocs.io/en/latest/installation.html

OCRmyPDF is a local command-line tool that adds a searchable text layer to scanned PDFs. It does not guarantee perfect recognition; verify important text against the page image.

## Install on Ubuntu/Debian
```bash
sudo apt update
sudo apt install -y ocrmypdf tesseract-ocr-rus tesseract-ocr-eng
ocrmypdf --version
tesseract --list-langs
```

For other operating systems, follow the official installation guide. Package names and available versions vary by distribution.

## Run on one PDF
```bash
ocrmypdf -l rus+eng --deskew --rotate-pages --skip-text input.pdf output_searchable.pdf
```
Use `--skip-text` for PDFs that may already contain text. Keep the original file unchanged.

## Batch processing
Put PDFs in a source folder, then run:
```bash
bash scripts/ocrmypdf-batch.sh ./pdf_in ./pdf_searchable rus+eng
```
The script processes only PDFs directly inside the input folder, skips outputs that already exist, and returns a failing exit status if any conversion fails. It does not recurse into subfolders.

## Quality controls
1. Confirm page count and open the resulting PDF.
2. Search for representative Russian and English phrases.
3. Visually verify every critical number, unit, formula, date, patent citation, percentage, temperature, and process parameter.
4. Keep original + OCR copy + command/tool version + reviewer status together.
5. Do not use unverified OCR output as the sole source for regulatory, patent, clinical, or manufacturing decisions.

## Security
OCR runs locally; do not upload confidential R&D, legal, personal, or unpublished patent documents to third-party services without authorization. Installing the package requires access to the target machine and may require administrator privileges.
