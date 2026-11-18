import argparse
import json
import os
import sys
from pathlib import Path

# Add python common to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from common.utils import emit_result, emit_error

try:
    import fitz  # PyMuPDF
    from PIL import Image
except ImportError as e:
    emit_error(f"Falta una dependencia requerida: {str(e)}", "MISSING_DEPENDENCY")

PAGE_SIZES = {
    "A3": (842.0, 1191.0),
    "A4": (595.0, 842.0),
    "A5": (420.0, 595.0),
}

def main():
    parser = argparse.ArgumentParser(description="Convert images to a single PDF document")
    parser.add_argument("--files-json", required=True, help="JSON list of image file paths in ordered sequence")
    parser.add_argument("--output-dir", required=True, help="Directory to save resulting PDF")
    parser.add_argument("--output-name", default="imagenes_unidas.pdf", help="Output PDF file name")
    parser.add_argument("--page-size", default="A4", choices=["A3", "A4", "A5", "original"], help="Page size")

    args = parser.parse_args()

    output_dir = os.path.abspath(args.output_dir)
    os.makedirs(output_dir, exist_ok=True)

    try:
        image_paths = json.loads(args.files_json)
    except Exception:
        emit_error("Formato inválido de lista de imágenes (debe ser JSON)", "INVALID_PARAM")

    if not isinstance(image_paths, list) or len(image_paths) == 0:
        emit_error("Se requiere al menos una imagen para generar el PDF", "EMPTY_INPUT")

    doc = fitz.open()

    for idx, img_path in enumerate(image_paths):
        if not os.path.exists(img_path):
            emit_error(f"La imagen no existe: {img_path}", "FILE_NOT_FOUND")

        try:
            with Image.open(img_path) as pil_img:
                img_w, img_h = pil_img.size
                dpi = pil_img.info.get("dpi", (72, 72))
                dpi_x = dpi[0] if isinstance(dpi, tuple) and len(dpi) > 0 and dpi[0] > 0 else 72
                dpi_y = dpi[1] if isinstance(dpi, tuple) and len(dpi) > 1 and dpi[1] > 0 else 72
        except Exception as e:
            emit_error(f"No se pudo leer la imagen {img_path}: {str(e)}", "INVALID_IMAGE")

        is_landscape = img_w > img_h

        if args.page_size == "original":
            # 72 points per inch
            page_w = (img_w / dpi_x) * 72.0
            page_h = (img_h / dpi_y) * 72.0
        else:
            std_w, std_h = PAGE_SIZES.get(args.page_size, PAGE_SIZES["A4"])
            if is_landscape:
                page_w, page_h = max(std_w, std_h), min(std_w, std_h)
            else:
                page_w, page_h = min(std_w, std_h), max(std_w, std_h)

        # Calculate bounding rect to fit and center without cropping
        scale = min(page_w / img_w, page_h / img_h)
        fitted_w = img_w * scale
        fitted_h = img_h * scale
        offset_x = (page_w - fitted_w) / 2.0
        offset_y = (page_h - fitted_h) / 2.0

        rect = fitz.Rect(offset_x, offset_y, offset_x + fitted_w, offset_y + fitted_h)

        page = doc.new_page(width=page_w, height=page_h)
        try:
            page.insert_image(rect, filename=img_path)
        except Exception as e:
            emit_error(f"Error al insertar la imagen {idx + 1} en el PDF: {str(e)}", "INSERT_ERROR")

    out_name = args.output_name if args.output_name.endswith(".pdf") else f"{args.output_name}.pdf"
    output_pdf_path = os.path.join(output_dir, out_name)
    doc.save(output_pdf_path)
    doc.close()

    emit_result({
        "status": "success",
        "pagesCount": len(image_paths),
        "output": {
            "name": out_name,
            "path": output_pdf_path,
            "size": os.path.getsize(output_pdf_path)
        }
    })

if __name__ == "__main__":
    main()
