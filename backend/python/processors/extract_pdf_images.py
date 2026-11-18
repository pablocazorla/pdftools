import argparse
import io
import os
import sys
from pathlib import Path

# Add python common to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from common.utils import emit_result, emit_error, check_pdf_encrypted, create_zip

try:
    import fitz  # PyMuPDF
    from PIL import Image
except ImportError as e:
    emit_error(f"Falta una dependencia requerida: {str(e)}", "MISSING_DEPENDENCY")

def get_image_format(ext: str) -> str:
    ext_clean = ext.lower().replace(".", "")
    if ext_clean in ("jpg", "jpeg"):
        return "JPEG"
    if ext_clean == "png":
        return "PNG"
    if ext_clean in ("tiff", "tif"):
        return "TIFF"
    if ext_clean == "webp":
        return "WEBP"
    return "PNG"

def inspect_images(doc, output_dir, safe_base):
    """Scan and generate thumbnails for detected embedded images."""
    detected = []
    seen_xrefs = set()
    img_counter = 1

    thumb_dir = os.path.join(output_dir, "thumbs")
    os.makedirs(thumb_dir, exist_ok=True)

    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images(full=True)

        for img_info in image_list:
            xref = img_info[0]
            if xref in seen_xrefs:
                continue
            seen_xrefs.add(xref)

            try:
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                width = base_image["width"]
                height = base_image["height"]

                # Create lightweight thumbnail
                pil_img = Image.open(io.BytesIO(image_bytes))
                thumb_copy = pil_img.copy()
                thumb_copy.thumbnail((250, 250))
                
                img_id = f"img_{img_counter}"
                thumb_name = f"thumb_{img_id}.png"
                thumb_path = os.path.join(thumb_dir, thumb_name)
                
                # Convert RGBA to RGB for thumbnail if needed or save PNG
                if thumb_copy.mode in ("RGBA", "LA") or (thumb_copy.mode == "P" and "transparency" in thumb_copy.info):
                    thumb_copy.save(thumb_path, format="PNG")
                else:
                    thumb_copy.convert("RGB").save(thumb_path, format="JPEG", quality=85)

                detected.append({
                    "id": img_id,
                    "xref": xref,
                    "page": page_num + 1,
                    "width": width,
                    "height": height,
                    "format": image_ext.upper(),
                    "size": len(image_bytes),
                    "thumbName": thumb_name,
                    "thumbPath": thumb_path
                })
                img_counter += 1
            except Exception:
                continue

    return detected

def main():
    parser = argparse.ArgumentParser(description="Extract embedded images from PDF")
    parser.add_argument("--input", required=True, help="Path to input PDF file")
    parser.add_argument("--output-dir", required=True, help="Output directory")
    parser.add_argument("--base-name", default="imagen", help="Base name for images")
    parser.add_argument("--format", default="png", choices=["png", "jpg", "jpeg"], help="Target format")
    parser.add_argument("--inspect-only", action="store_true", help="Only inspect and return detected images")
    parser.add_argument("--selected-ids", help="Comma-separated IDs of images to extract (e.g. img_1,img_2)")

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

    safe_base = "".join(c for c in args.base_name if c.isalnum() or c in (' ', '_', '-')).strip() or "imagen"

    detected_images = inspect_images(doc, output_dir, safe_base)

    if args.inspect_only:
        doc.close()
        emit_result({
            "status": "success",
            "mode": "inspect",
            "totalDetected": len(detected_images),
            "images": detected_images
        })
        return

    target_format = "jpg" if args.format in ("jpg", "jpeg") else "png"
    selected_set = set(args.selected_ids.split(",")) if args.selected_ids else None

    extracted_files = []
    zip_items = []

    for item in detected_images:
        img_id = item["id"]
        if selected_set and img_id not in selected_set:
            continue

        xref = item["xref"]
        try:
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            pil_img = Image.open(io.BytesIO(image_bytes))

            ext = "jpg" if target_format == "jpg" else "png"
            file_name = f"{safe_base}_{img_id}_pag{item['page']}.{ext}"
            file_path = os.path.join(output_dir, file_name)

            if target_format == "jpg":
                # Handle alpha channel: apply white background
                if pil_img.mode in ("RGBA", "LA") or (pil_img.mode == "P" and "transparency" in pil_img.info):
                    background = Image.new("RGB", pil_img.size, (255, 255, 255))
                    pil_img = pil_img.convert("RGBA")
                    background.paste(pil_img, mask=pil_img.split()[3])
                    background.save(file_path, "JPEG", quality=95)
                else:
                    pil_img.convert("RGB").save(file_path, "JPEG", quality=95)
            else:
                # Target PNG - preserves transparency
                pil_img.save(file_path, "PNG")

            file_size = os.path.getsize(file_path)
            extracted_files.append({
                "id": img_id,
                "name": file_name,
                "path": file_path,
                "page": item["page"],
                "width": item["width"],
                "height": item["height"],
                "size": file_size,
                "format": target_format.upper()
            })
            zip_items.append((file_path, file_name))
        except Exception as e:
            # Report or skip individual broken image without aborting other images
            continue

    zip_name = f"{safe_base}-extracted-images.zip"
    zip_path = os.path.join(output_dir, zip_name)
    create_zip(zip_path, zip_items)
    zip_size = os.path.getsize(zip_path) if os.path.exists(zip_path) else 0

    doc.close()

    emit_result({
        "status": "success",
        "extractedCount": len(extracted_files),
        "files": extracted_files,
        "zip": {
            "name": zip_name,
            "path": zip_path,
            "size": zip_size
        } if zip_items else None
    })

if __name__ == "__main__":
    main()
