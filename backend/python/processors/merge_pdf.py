import argparse
import json
import os
import sys
from pathlib import Path

# Add python common to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from common.utils import emit_result, emit_error, check_pdf_encrypted

try:
    import fitz  # PyMuPDF
except ImportError:
    emit_error("PyMuPDF no está instalado", "MISSING_DEPENDENCY")

def main():
    parser = argparse.ArgumentParser(description="Merge multiple PDF files into one")
    parser.add_argument("--files-json", required=True, help="JSON list of PDF paths in sequence")
    parser.add_argument("--output-dir", required=True, help="Output directory")
    parser.add_argument("--output-name", default="documentos_combinados.pdf", help="Output PDF name")

    args = parser.parse_args()

    output_dir = os.path.abspath(args.output_dir)
    os.makedirs(output_dir, exist_ok=True)

    try:
        pdf_paths = json.loads(args.files_json)
    except Exception:
        emit_error("Formato inválido de lista de archivos", "INVALID_PARAM")

    if not isinstance(pdf_paths, list) or len(pdf_paths) < 2:
        emit_error("Se requieren al menos dos archivos PDF para combinar", "INSUFFICIENT_FILES")

    merged_doc = fitz.open()
    total_pages = 0

    for idx, path in enumerate(pdf_paths):
        if not os.path.exists(path):
            emit_error(f"El archivo no existe: {path}", "FILE_NOT_FOUND")

        try:
            doc = fitz.open(path)
        except Exception as e:
            emit_error(f"No se pudo leer el archivo #{idx + 1}: {str(e)}", "INVALID_PDF")

        check_pdf_encrypted(doc)

        try:
            merged_doc.insert_pdf(doc)
            total_pages += len(doc)
            doc.close()
        except Exception as e:
            emit_error(f"Error al combinar el archivo #{idx + 1}: {str(e)}", "MERGE_ERROR")

    out_name = args.output_name if args.output_name.endswith(".pdf") else f"{args.output_name}.pdf"
    output_path = os.path.join(output_dir, out_name)
    merged_doc.save(output_path)
    merged_doc.close()

    emit_result({
        "status": "success",
        "filesMerged": len(pdf_paths),
        "totalPages": total_pages,
        "output": {
            "name": out_name,
            "path": output_path,
            "size": os.path.getsize(output_path)
        }
    })

if __name__ == "__main__":
    main()
