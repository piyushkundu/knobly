import sys
import subprocess

try:
    import fitz
except ImportError:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--user', 'PyMuPDF'])
    import fitz

try:
    doc = fitz.open('src/app/python/chapter7.pdf')
    with open('temp_pdf_output2.txt', 'w', encoding='utf-8') as f:
        for page in doc:
            f.write(page.get_text() + "\n")
    print("PDF extracted successfully to temp_pdf_output2.txt")
except Exception as e:
    print(f"Error: {e}")
