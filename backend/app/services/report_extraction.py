"""Local text extraction; fields are review aids, never diagnoses."""
from __future__ import annotations
import re
from pathlib import Path
FIELD_PATTERNS={"BI-RADS category":r"BI[- ]?RADS?\s*[:#-]?\s*([0-6][A-C]?)","imaging modality":r"\b(mammogram|ultrasound|MRI)\b","breast side":r"\b(left|right|bilateral)\b","lesion location":r"\b(upper|lower|inner|outer|nipple|underarm)[^,.\n]{0,40}","lesion size":r"\b(\d+(?:\.\d+)?\s*(?:mm|cm))\b","follow-up interval":r"\b(\d+\s*(?:month|week|year)s?)\b","radiologist recommendation":r"(?:recommend(?:ed|ation)?|follow[- ]?up)\s*[:.-]?\s*([^\n.]{5,160})"}
def extract_pdf(path:Path)->list[tuple[int,str]]:
    import fitz
    doc=fitz.open(path); pages=[(i+1,page.get_text()) for i,page in enumerate(doc)]
    if not any(text.strip() for _,text in pages):
        import pdfplumber
        with pdfplumber.open(path) as pdf: pages=[(i+1,page.extract_text() or "") for i,page in enumerate(pdf.pages)]
    return pages
def extract_image(path:Path)->list[tuple[int,str]]:
    from PIL import Image
    import cv2, numpy as np, pytesseract
    image=np.array(Image.open(path).convert("L")); image=cv2.threshold(image,0,255,cv2.THRESH_BINARY+cv2.THRESH_OTSU)[1]
    return [(1,pytesseract.image_to_string(image))]
def extract_document(path:Path,mime:str)->list[dict]:
    pages=extract_pdf(path) if mime=="application/pdf" else extract_image(path)
    return structured_fields(pages)
def structured_fields(pages:list[tuple[int,str]])->list[dict]:
    values=[]
    for page,text in pages:
        for field,pattern in FIELD_PATTERNS.items():
            match=re.search(pattern,text,re.I)
            if match and not any(v["field_name"]==field for v in values): values.append({"field_name":field,"field_value":match.group(1).strip(),"source_page":page})
    return values
