import argparse
import os
import sys
from pathlib import Path

# Add python common to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from common.utils import emit_result, emit_error, check_pdf_encrypted, create_zip

try:
    import fitz  # PyMuPDF
except ImportError:
    emit_error("PyMuPDF no está instalado en el entorno de Python", "MISSING_DEPENDENCY")

def main():
    parser = argparse.ArgumentParser(description="Convert PDF pages to PNG images at 300 DPI")
    parser.add_argument("--input", required=True, help="Path to input PDF file")
    parser.add_argument("--output-dir", required=True, help="Directory to save PNG images and zip")
    parser.add_argument("--base-name", default="documento", help="Base name for exported images")
    parser.add_argument("--dpi", type=int, default=300, help="DPI resolution for rendering (default: 300)")

    args = parser.parse_args()

    input_path = os.path.abspath(args.input)
    output_dir = os.path.abspath(args.output_dir)
    os.makedirs(output_dir, exist_ok=True)

    if not os.path.exists(input_path):
        emit_error(f"El archivo de entrada no existe: {input_path}", "FILE_NOT_FOUND")

    try:
        doc = fitz.open(input_path)
    except Exception as e:
        emit_error(f"No se pudo abrir el archivo PDF: {str(e)}", "INVALID_PDF")

    check_pdf_encrypted(doc)

    total_pages = len(doc)
    if total_pages == 0:
        emit_error("El documento PDF no contiene páginas procesables.", "EMPTY_PDF")

    safe_base = "".join(c for c in args.base_name if c.isalnum() or c in (' ', '_', '-')).strip()
    if not safe_base:
        safe_base = "documento"

    page_files = []
    zip_items = []

    for page_num in range(total_pages):
        page = doc[page_num]
        display_page = page_num + 1
        page_str = str(display_page).zfill(3)
        file_name = f"{safe_base}-page-{page_str}.png"
        file_path = os.path.join(output_dir, file_name)

        try:
            # 300 DPI effective rendering
            pix = page.get_pixmap(dpi=args.dpi, alpha=False)
            pix.save(file_path)

            file_size = os.path.getsize(file_path)
            page_files.append({
                "name": file_name,
                "path": file_path,
                "page": display_page,
                "width": pix.width,
                "height": pix.height,
                "size": file_size
            })
            zip_items.append((file_path, file_name))
        except Exception as e:
            emit_error(f"Error al renderizar la página {display_page}: {str(e)}", "RENDER_ERROR")

    # Generate ZIP
    zip_name = f"{safe_base}-all-pages.zip"
    zip_path = os.path.join(output_dir, zip_name)
    create_zip(zip_path, zip_items)
    zip_size = os.path.getsize(zip_path)

    doc.close()

    emit_result({
        "status": "success",
        "pagesCount": total_pages,
        "files": page_files,
        "zip": {
            "name": zip_name,
            "path": zip_path,
            "size": zip_size
        }
    })

if __name__ == "__main__":
    main()
