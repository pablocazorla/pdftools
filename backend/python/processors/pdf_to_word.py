import argparse
import os
import sys
from pathlib import Path

# Add python common to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from common.utils import emit_result, emit_error, check_pdf_encrypted

try:
    import fitz  # PyMuPDF
    import docx
    from docx.shared import Inches, Pt
    from docx.enum.section import WD_SECTION, WD_ORIENT
except ImportError as e:
    emit_error(f"Falta una dependencia requerida: {str(e)}", "MISSING_DEPENDENCY")

def main():
    parser = argparse.ArgumentParser(description="Convert PDF pages to Word DOCX document as high-fidelity images")
    parser.add_argument("--input", required=True, help="Input PDF file path")
    parser.add_argument("--output-dir", required=True, help="Output directory")
    parser.add_argument("--output-name", default="documento.docx", help="Output DOCX file name")
    parser.add_argument("--dpi", type=int, default=200, help="Rendering DPI for page images")

    args = parser.parse_args()

    input_path = os.path.abspath(args.input)
    output_dir = os.path.abspath(args.output_dir)
    os.makedirs(output_dir, exist_ok=True)

    if not os.path.exists(input_path):
        emit_error("El archivo de entrada no existe", "FILE_NOT_FOUND")

    try:
        pdf_doc = fitz.open(input_path)
    except Exception as e:
        emit_error(f"No se pudo abrir el archivo PDF: {str(e)}", "INVALID_PDF")

    check_pdf_encrypted(pdf_doc)

    total_pages = len(pdf_doc)
    if total_pages == 0:
        emit_error("El archivo PDF no tiene páginas para convertir", "EMPTY_PDF")

    temp_img_dir = os.path.join(output_dir, "temp_docx_pages")
    os.makedirs(temp_img_dir, exist_ok=True)

    word_doc = docx.Document()

    for page_idx in range(total_pages):
        page = pdf_doc[page_idx]
        rect = page.rect
        width_pt = rect.width
        height_pt = rect.height

        # Render page to PNG
        pix = page.get_pixmap(dpi=args.dpi, alpha=False)
        img_path = os.path.join(temp_img_dir, f"page_{page_idx + 1}.png")
        pix.save(img_path)

        if page_idx == 0:
            section = word_doc.sections[0]
        else:
            section = word_doc.add_section(WD_SECTION.NEW_PAGE)

        # Set section margins to 0.25 inches (18pt) for clean alignment
        margin = Inches(0.25)
        section.top_margin = margin
        section.bottom_margin = margin
        section.left_margin = margin
        section.right_margin = margin

        # Apply orientation & dimensions
        section.page_width = Pt(width_pt)
        section.page_height = Pt(height_pt)

        if width_pt > height_pt:
            section.orientation = WD_ORIENT.LANDSCAPE
        else:
            section.orientation = WD_ORIENT.PORTRAIT

        # Effective printable width
        usable_w_pt = max(10, width_pt - 36)
        p = word_doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.0
        run = p.add_run()
        run.add_picture(img_path, width=Pt(usable_w_pt))

    pdf_doc.close()

    out_name = args.output_name if args.output_name.endswith(".docx") else f"{args.output_name}.docx"
    output_docx_path = os.path.join(output_dir, out_name)
    word_doc.save(output_docx_path)

    # Clean up temporary page images
    try:
        for f in os.listdir(temp_img_dir):
            os.remove(os.path.join(temp_img_dir, f))
        os.rmdir(temp_img_dir)
    except Exception:
        pass

    emit_result({
        "status": "success",
        "totalPages": total_pages,
        "isVisualFidelityOnly": True,
        "output": {
            "name": out_name,
            "path": output_docx_path,
            "size": os.path.getsize(output_docx_path)
        }
    })

if __name__ == "__main__":
    main()
