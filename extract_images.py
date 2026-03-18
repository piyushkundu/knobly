import fitz
import os

pdf_path = "src/app/python/chapter7.pdf"
output_dir = "public/images"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

doc = fitz.open(pdf_path)
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    output_path = os.path.join(output_dir, f"dict_bp_pg_{i+1}.png")
    pix.save(output_path)
    print(f"Saved {output_path}")
