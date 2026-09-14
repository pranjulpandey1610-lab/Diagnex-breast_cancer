"""Strict local admission controls for patient report uploads."""
from __future__ import annotations
import hashlib, subprocess, tempfile
from pathlib import Path
from cryptography.fernet import Fernet

ALLOWED={"application/pdf":(".pdf",b"%PDF-"),"image/jpeg":(".jpg",b"\xff\xd8\xff"),"image/png":(".png",b"\x89PNG\r\n\x1a\n")}
MAX_BYTES=20*1024*1024
def validate_upload(name:str, declared:str, content:bytes)->str:
    if len(content)>MAX_BYTES: raise ValueError("Report exceeds the 20 MB limit")
    suffix=Path(name).suffix.lower(); actual=next((mime for mime,(ext,magic) in ALLOWED.items() if content.startswith(magic)),None)
    if not actual or declared not in ALLOWED or suffix not in {ALLOWED[actual][0], ".jpeg" if actual=="image/jpeg" else ALLOWED[actual][0]} or actual!=declared: raise ValueError("File extension, MIME type, and file signature must agree")
    return actual
def clamav_scan(content:bytes)->str:
    with tempfile.NamedTemporaryFile() as temp:
        temp.write(content);temp.flush()
        try: result=subprocess.run(["clamscan","--no-summary",temp.name],capture_output=True,text=True,timeout=45)
        except FileNotFoundError: return "unavailable"
    return "clean" if result.returncode==0 else "infected" if result.returncode==1 else "scan_error"
def encrypt_to_private_store(content:bytes,key:str,target:Path)->str:
    target.parent.mkdir(parents=True,exist_ok=True); target.write_bytes(Fernet(key.encode()).encrypt(content)); return hashlib.sha256(content).hexdigest()
