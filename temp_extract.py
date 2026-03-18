import sys
import subprocess
import os

try:
    import PyPDF2
except ImportError:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--user', 'PyPDF2'])
    import PyPDF2

try:
    reader = PyPDF2.PdfReader('src/app/python/chapter7.pdf')
    with open('temp_pdf_output.txt', 'w', encoding='utf-8') as f:
        for p in reader.pages:
            f.write(p.extract_text() + "\n")
    print("PDF extracted successfully to temp_pdf_output.txt")
except Exception as e:
    print(f"Error extracting PDF: {e}")
