"""
backend/app/core/file_reader.py — Fayl o'qish yordamchisi
"""
import os


def read_file(path: str) -> str:
    """Fayl turini aniqlab matnini o'qish."""
    ext = os.path.splitext(path)[-1].lower()

    if ext == '.pdf':
        return _read_pdf(path)
    elif ext == '.docx':
        return _read_docx(path)
    elif ext in ('.txt', '.md', '.csv', '.json', '.py', '.js'):
        return _read_text(path)
    else:
        return _read_text(path)


def _read_pdf(path: str) -> str:
    try:
        import PyPDF2
        with open(path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            pages  = [p.extract_text() or '' for p in reader.pages]
            return '\n'.join(pages).strip()
    except ImportError:
        return "[PyPDF2 o'rnatilmagan]"
    except Exception as e:
        return f"[PDF o'qish xato: {e}]"


def _read_docx(path: str) -> str:
    try:
        from docx import Document
        doc   = Document(path)
        paras = [p.text for p in doc.paragraphs if p.text.strip()]
        return '\n'.join(paras).strip()
    except ImportError:
        return "[python-docx o'rnatilmagan]"
    except Exception as e:
        return f"[DOCX o'qish xato: {e}]"


def _read_text(path: str) -> str:
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except Exception as e:
        return f"[Fayl o'qish xato: {e}]"


def get_file_info(path: str) -> dict:
    """Fayl haqida ma'lumot."""
    stat = os.stat(path)
    return {
        "name":       os.path.basename(path),
        "size_kb":    round(stat.st_size / 1024, 1),
        "extension":  os.path.splitext(path)[-1].lower(),
    }