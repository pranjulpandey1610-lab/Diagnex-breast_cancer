"""Private patient report PDFs. Content is informational, never diagnostic."""
from io import BytesIO
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
DISCLAIMER="This report organizes information entered by the user and information extracted from uploaded documents. It is not a diagnosis and does not replace clinical examination, radiology interpretation, pathology testing, or advice from a qualified healthcare professional."
def build_pdf(report_id:str, snapshot:dict)->bytes:
    stream=BytesIO();doc=SimpleDocTemplate(stream,pagesize=A4);styles=getSampleStyleSheet();story=[]
    story += [Paragraph("DIAGNEX",styles['Title']),Paragraph("Breast-health information report",styles['Heading2']),Paragraph(f"Report ID: {report_id}",styles['Normal']),Spacer(1,14)]
    for title,key,label in [("Breast-awareness summary","summary","User-entered information"),("Uploaded-report summary","uploaded_reports","Extracted from uploaded clinical report"),("Recommended next steps","next_steps","Recommended next steps")]:
        value=snapshot.get(key)
        if value: story += [Paragraph(title,styles['Heading2']),Paragraph(label,styles['Italic']),Paragraph(str(value),styles['BodyText']),Spacer(1,10)]
    story += [Paragraph("Find a specialist",styles['Heading2']),Paragraph("Use Diagnex’s external specialist directory to independently find public contact information.",styles['BodyText']),Spacer(1,10),Paragraph("Medical disclaimer",styles['Heading2']),Paragraph(DISCLAIMER,styles['BodyText'])]
    doc.build(story);return stream.getvalue()
