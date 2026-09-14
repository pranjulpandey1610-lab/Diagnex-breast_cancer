"""Self-hosted Orthanc gateway. Credentials remain server-side."""
import os, urllib.request
def upload_instance(content:bytes)->str:
    base=os.getenv("ORTHANC_URL","").rstrip("/")
    if not base: raise RuntimeError("Orthanc is not configured")
    request=urllib.request.Request(base+"/instances",data=content,method="POST",headers={"Content-Type":"application/dicom"})
    password=os.getenv("ORTHANC_PASSWORD",""); user=os.getenv("ORTHANC_USERNAME","orthanc")
    if password:
        import base64; request.add_header("Authorization","Basic "+base64.b64encode(f"{user}:{password}".encode()).decode())
    with urllib.request.urlopen(request,timeout=30) as response: return response.read().decode()
