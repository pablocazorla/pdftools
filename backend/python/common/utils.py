import json
import sys
import os
import zipfile

def emit_result(data: dict):
    """Outputs a single-line JSON result to stdout."""
    print(json.dumps(data), flush=True)

def emit_error(message: str, code: str = "PROCESSING_ERROR"):
    """Outputs a single-line JSON error to stdout and exits with code 1."""
    print(json.dumps({"error": message, "code": code}), flush=True)
    sys.exit(1)

def check_pdf_encrypted(doc):
    """Checks if a fitz document is password-protected or encrypted."""
    if doc.is_encrypted:
        emit_error("El documento PDF está protegido por contraseña y no se puede procesar.", "PDF_ENCRYPTED")

def create_zip(zip_path: str, file_tuples: list):
    """
    Creates a zip file at zip_path.
    file_tuples is a list of (physical_path, arcname_in_zip).
    """
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        for file_path, arcname in file_tuples:
            if os.path.exists(file_path):
                zf.write(file_path, arcname=arcname)
