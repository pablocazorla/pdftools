import argparse
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
    parser = argparse.ArgumentParser(description="Extract digital text from PDF")
    parser.add_argument("--input", required=True, help="Input PDF file path")
    parser.add_argument("--output-dir", required=True, help="Output directory")
    parser.add_argument("--base-name", default="texto_extraido", help="Base name for text file")

    args = parser.parse_args()

    input_path = os.path.abspath(args.input)
    output_dir = os.path.abspath(args.output_dir)
    os.makedirs(output_dir, exist_ok=True)

    if not os.path.exists(input_path):
        emit_error("El archivo de entrada no existe", "FILE_NOT_FOUND")

    try:
        doc = fitz.open(input_path)
    except Exception as e:
        emit_error(f"No se pudo abrir el archivo PDF: {str(e)}", "INVALID_PDF")

    check_pdf_encrypted(doc)

    total_pages = len(doc)
    if total_pages == 0:
        emit_error("El documento no contiene páginas", "EMPTY_PDF")

    safe_base = "".join(c for c in args.base_name if c.isalnum() or c in (' ', '_', '-')).strip() or "texto_extraido"

    full_text_chunks = []
    total_character_count = 0
    pages_with_text = 0

    for page_num in range(total_pages):
        page = doc[page_num]
        page_display = page_num + 1
        page_text = page.get_text("text").strip()

        separator = f"--- Página {page_display} ---"
        if page_text:
            pages_with_text += 1
            total_character_count += len(page_text)
            full_text_chunks.append(f"{separator}\n\n{page_text}\n")
        else:
            full_text_chunks.append(f"{separator}\n\n[Esta página no contiene texto seleccionable]\n")

    doc.close()

    full_text = "\n".join(full_text_chunks)
    has_selectable_text = pages_with_text > 0

    txt_filename = f"{safe_base}.txt"
    txt_filepath = os.path.join(output_dir, txt_filename)

    with open(txt_filepath, "w", encoding="utf-8") as f:
        f.write(full_text)

    emit_result({
        "status": "success",
        "totalPages": total_pages,
        "pagesWithText": pages_with_text,
        "hasSelectableText": has_selectable_text,
        "totalCharacters": total_character_count,
        "extractedText": full_text,
        "output": {
            "name": txt_filename,
            "path": txt_filepath,
            "size": os.path.getsize(txt_filepath)
        }
    })

if __name__ == "__main__":
    main()
