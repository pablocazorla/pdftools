import os
import sys
import tempfile
import fitz
from PIL import Image
import io
import subprocess
import json

def create_sample_pdf(path: str):
    doc = fitz.open()

    # Create a small sample image
    img = Image.new("RGBA", (120, 80), (255, 100, 50, 200))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()

    # Page 1: with text and embedded image
    page1 = doc.new_page(width=595, height=842)
    page1.insert_text((50, 100), "Documento de prueba - Página 1", fontsize=16)
    page1.insert_text((50, 130), "Este es un párrafo de texto digital extraíble para probar PDF Tools.", fontsize=12)
    page1.insert_image(fitz.Rect(50, 180, 250, 320), stream=img_bytes)

    # Page 2: with text
    page2 = doc.new_page(width=595, height=842)
    page2.insert_text((50, 100), "Segunda página del documento PDF", fontsize=16)
    page2.insert_text((50, 130), "Contenido de la página 2 para pruebas de división y combinación.", fontsize=12)

    doc.save(path)
    doc.close()

def run_test():
    with tempfile.TemporaryDirectory() as tmpdir:
        sample_pdf = os.path.join(tmpdir, "sample.pdf")
        create_sample_pdf(sample_pdf)
        print(f"[OK] Sample PDF created: {sample_pdf}")

        processors_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../python/processors"))

        # 1. Test pdf_to_images.py
        p1 = subprocess.run([
            sys.executable,
            os.path.join(processors_dir, "pdf_to_images.py"),
            "--input", sample_pdf,
            "--output-dir", os.path.join(tmpdir, "p1"),
            "--dpi", "150"
        ], capture_output=True, text=True)
        assert p1.returncode == 0, f"pdf_to_images failed: {p1.stderr}"
        res1 = json.loads(p1.stdout.strip().split("\n")[-1])
        assert res1["status"] == "success" and res1["pagesCount"] == 2
        print("[OK] pdf_to_images.py passed")

        # 2. Test extract_pdf_images.py (inspect & extract)
        p2_inspect = subprocess.run([
            sys.executable,
            os.path.join(processors_dir, "extract_pdf_images.py"),
            "--input", sample_pdf,
            "--output-dir", os.path.join(tmpdir, "p2"),
            "--inspect-only"
        ], capture_output=True, text=True)
        assert p2_inspect.returncode == 0
        res2_inspect = json.loads(p2_inspect.stdout.strip().split("\n")[-1])
        assert res2_inspect["totalDetected"] >= 1
        print("[OK] extract_pdf_images.py inspect mode passed")

        p2_extract = subprocess.run([
            sys.executable,
            os.path.join(processors_dir, "extract_pdf_images.py"),
            "--input", sample_pdf,
            "--output-dir", os.path.join(tmpdir, "p2_ext"),
            "--format", "jpg"
        ], capture_output=True, text=True)
        assert p2_extract.returncode == 0
        res2_ext = json.loads(p2_extract.stdout.strip().split("\n")[-1])
        assert res2_ext["extractedCount"] >= 1
        print("[OK] extract_pdf_images.py extraction to JPG with alpha handling passed")

        # 3. Test images_to_pdf.py
        sample_img = os.path.join(tmpdir, "img1.png")
        Image.new("RGB", (300, 200), (40, 120, 220)).save(sample_img)
        p3 = subprocess.run([
            sys.executable,
            os.path.join(processors_dir, "images_to_pdf.py"),
            "--files-json", json.dumps([sample_img]),
            "--output-dir", os.path.join(tmpdir, "p3"),
            "--page-size", "A4"
        ], capture_output=True, text=True)
        assert p3.returncode == 0
        res3 = json.loads(p3.stdout.strip().split("\n")[-1])
        assert res3["pagesCount"] == 1
        print("[OK] images_to_pdf.py passed")

        # 4. Test merge_pdf.py
        p4 = subprocess.run([
            sys.executable,
            os.path.join(processors_dir, "merge_pdf.py"),
            "--files-json", json.dumps([sample_pdf, sample_pdf]),
            "--output-dir", os.path.join(tmpdir, "p4")
        ], capture_output=True, text=True)
        assert p4.returncode == 0
        res4 = json.loads(p4.stdout.strip().split("\n")[-1])
        assert res4["totalPages"] == 4
        print("[OK] merge_pdf.py passed")

        # 5. Test split_pdf.py
        p5 = subprocess.run([
            sys.executable,
            os.path.join(processors_dir, "split_pdf.py"),
            "--input", sample_pdf,
            "--ranges-json", json.dumps([{"start": 1, "end": 1, "label": "pag-1"}, {"start": 2, "end": 2, "label": "pag-2"}]),
            "--output-dir", os.path.join(tmpdir, "p5")
        ], capture_output=True, text=True)
        assert p5.returncode == 0
        res5 = json.loads(p5.stdout.strip().split("\n")[-1])
        assert res5["splitCount"] == 2
        print("[OK] split_pdf.py passed")

        # 6. Test extract_pdf_text.py
        p6 = subprocess.run([
            sys.executable,
            os.path.join(processors_dir, "extract_pdf_text.py"),
            "--input", sample_pdf,
            "--output-dir", os.path.join(tmpdir, "p6")
        ], capture_output=True, text=True)
        assert p6.returncode == 0
        res6 = json.loads(p6.stdout.strip().split("\n")[-1])
        assert res6["hasSelectableText"] is True
        assert "Documento de prueba" in res6["extractedText"]
        print("[OK] extract_pdf_text.py passed")

        # 7. Test pdf_to_word.py
        p7 = subprocess.run([
            sys.executable,
            os.path.join(processors_dir, "pdf_to_word.py"),
            "--input", sample_pdf,
            "--output-dir", os.path.join(tmpdir, "p7")
        ], capture_output=True, text=True)
        assert p7.returncode == 0
        res7 = json.loads(p7.stdout.strip().split("\n")[-1])
        assert res7["totalPages"] == 2
        assert os.path.exists(res7["output"]["path"])
        print("[OK] pdf_to_word.py passed")

    print("\n🎉 ALL 7 PYTHON PROCESSORS PASSED VERIFICATION!")

if __name__ == "__main__":
    run_test()
