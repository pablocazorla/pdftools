import argparse
import json
import os
import sys
from pathlib import Path

# Add python common to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from common.utils import emit_result, emit_error, check_pdf_encrypted, create_zip

try:
    import fitz  # PyMuPDF
except ImportError:
    emit_error("PyMuPDF no está instalado", "MISSING_DEPENDENCY")

def main():
    parser = argparse.ArgumentParser(description="Split PDF by page ranges")
    parser.add_argument("--input", required=True, help="Input PDF file path")
    parser.add_argument("--ranges-json", required=True, help="JSON array of ranges [{start, end, label}]")
    parser.add_argument("--output-dir", required=True, help="Output directory")
    parser.add_argument("--base-name", default="dividido", help="Base name for outputs")

    args = parser.parse_args()

    input_path = os.path.abspath(args.input)
    output_dir = os.path.abspath(args.output_dir)
    os.makedirs(output_dir, exist_ok=True)

    if not os.path.exists(input_path):
        emit_error("El archivo de entrada no existe", "FILE_NOT_FOUND")

    try:
        ranges = json.loads(args.ranges_json)
    except Exception:
        emit_error("Formato inválido de rangos (debe ser JSON)", "INVALID_PARAM")

    if not isinstance(ranges, list) or len(ranges) == 0:
        emit_error("Se requiere al menos un rango de páginas para dividir", "EMPTY_RANGES")

    try:
        src_doc = fitz.open(input_path)
    except Exception as e:
        emit_error(f"No se pudo abrir el documento PDF: {str(e)}", "INVALID_PDF")

    check_pdf_encrypted(src_doc)
    total_pages = len(src_doc)

    safe_base = "".join(c for c in args.base_name if c.isalnum() or c in (' ', '_', '-')).strip() or "dividido"

    split_files = []
    zip_items = []

    for idx, r in enumerate(ranges):
        start = r.get("start")
        end = r.get("end")
        label = r.get("label", f"seccion-{idx + 1}")

        if start is None or end is None:
            emit_error(f"El rango #{idx + 1} no especifica inicio o fin", "INVALID_RANGE")

        if start < 1 or end < 1 or start > total_pages or end > total_pages or start > end:
            emit_error(
                f"El rango {start}-{end} es inválido para un documento de {total_pages} páginas",
                "OUT_OF_BOUNDS_RANGE"
            )

        new_doc = fitz.open()
        # insert_pdf uses 0-based indexing: from_page is start - 1, to_page is end - 1
        new_doc.insert_pdf(src_doc, from_page=start - 1, to_page=end - 1)

        file_name = f"{safe_base}_{label}.pdf"
        file_path = os.path.join(output_dir, file_name)
        new_doc.save(file_path)
        new_doc.close()

        file_size = os.path.getsize(file_path)
        split_files.append({
            "name": file_name,
            "path": file_path,
            "start": start,
            "end": end,
            "pageCount": end - start + 1,
            "size": file_size
        })
        zip_items.append((file_path, file_name))

    src_doc.close()

    # Create ZIP containing all split PDFs
    zip_name = f"{safe_base}-all-splits.zip"
    zip_path = os.path.join(output_dir, zip_name)
    create_zip(zip_path, zip_items)
    zip_size = os.path.getsize(zip_path)

    emit_result({
        "status": "success",
        "totalDocumentPages": total_pages,
        "splitCount": len(split_files),
        "files": split_files,
        "zip": {
            "name": zip_name,
            "path": zip_path,
            "size": zip_size
        }
    })

if __name__ == "__main__":
    main()
