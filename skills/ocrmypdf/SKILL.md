---
name: ocrmypdf-document-ingestion
description: Prepare scanned PDFs for searchable, auditable text extraction in BIORICHEBRAIN research, regulatory, technical-card, and legal workflows. Use when a PDF is image-only, OCR text is missing, or document ingestion needs a reproducible OCR step.
---

# OCRmyPDF document ingestion

## Purpose
Use the open-source OCRmyPDF CLI to create a searchable copy of a PDF while preserving the original. This skill describes the workflow; it does not itself install software or execute scripts.

## Preconditions
- Confirm the operator has permission to process the documents.
- Keep original files unchanged; write results to a separate output directory.
- Verify OCRmyPDF and Tesseract language packs are installed with `ocrmypdf --version` and `tesseract --list-langs`.
- For Russian/English material, use `rus+eng`; add languages only when installed.
- Do not upload confidential, personal, proprietary, or unpublished patent files to external services without authorization. Local OCR is preferred.

## Workflow
1. Inventory the source PDF and note whether it already contains a text layer.
2. Run OCRmyPDF on a copy, using `--deskew --rotate-pages` for common scan defects.
3. Use `--skip-text` when mixed PDFs may already contain valid text; do not force OCR over existing text by default.
4. Inspect the output by copying/searching several representative passages, especially tables, decimal values, units, percentages, temperatures, and Cyrillic names.
5. Compare critical values against the page image. OCR output is not authoritative for formulas, regulatory citations, batch numbers, or process parameters.
6. Keep the original, searchable PDF, processing command, timestamp, tool version, language list, and review status together.
7. Pass extracted text to the relevant agent only after checking for missing pages, reading-order errors, and table corruption.

## Suggested command
```bash
ocrmypdf -l rus+eng --deskew --rotate-pages --skip-text input.pdf output_searchable.pdf
```

## BIORICHEBRAIN routing
- OCR AGENT: document preparation and OCR quality flags.
- MEMORY ENGINE: index only after review and retain source provenance.
- R&D CHEMIST / TECHNOLOGIST: flag every numerical parameter for image-level verification.
- LEGAL GUARD / REGULATORY WATCHDOG: verify quoted provisions and dates against the original page.
- QA INSPECTOR: record review outcome and unresolved OCR ambiguities.

## Safety and quality gates
- Never overwrite the source document.
- Never treat OCR text as proof of a claim or as a substitute for the source.
- Do not infer unreadable text; mark it `[неразборчиво — проверить изображение]`.
- For regulated product claims, patent decisions, or manufacturing release, require human review.
