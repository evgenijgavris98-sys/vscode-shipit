#!/usr/bin/env bash
set -Eeuo pipefail

usage() {
  echo "Usage: $0 INPUT_DIR OUTPUT_DIR [LANGUAGES]" >&2
  echo "Example: $0 ./pdf_in ./pdf_searchable rus+eng" >&2
}

[[ $# -ge 2 && $# -le 3 ]] || { usage; exit 2; }
input_dir=$1
output_dir=$2
languages=${3:-rus+eng}

command -v ocrmypdf >/dev/null 2>&1 || {
  echo "ERROR: ocrmypdf is not installed. See docs/ocrmypdf-biorichebrain.md" >&2
  exit 127
}
[[ -d "$input_dir" ]] || { echo "ERROR: input directory not found: $input_dir" >&2; exit 2; }
mkdir -p "$output_dir"

shopt -s nullglob nocaseglob
files=("$input_dir"/*.pdf)
(("${#files[@]}" > 0)) || { echo "No PDF files found in $input_dir"; exit 0; }

ok=0
failed=0
for input in "${files[@]}"; do
  base=$(basename "$input")
  output="$output_dir/${base%.*}_searchable.pdf"
  if [[ -e "$output" ]]; then
    echo "SKIP (output exists): $output"
    continue
  fi
  echo "OCR: $input -> $output (languages=$languages)"
  if ocrmypdf -l "$languages" --deskew --rotate-pages --skip-text "$input" "$output"; then
    echo "OK: $output"
    ((ok+=1))
  else
    status=$?
    echo "FAILED (exit $status): $input" >&2
    rm -f -- "$output"
    ((failed+=1))
  fi
done

echo "Finished. Successful: $ok; failed: $failed"
(( failed == 0 ))
