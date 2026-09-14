from app.worker.celery_app import celery_app
@celery_app.task(name="app.worker.tasks.extract_report")
def extract_report(upload_id:str):
    """Reserved Celery job: extraction runs after a clean malware scan."""
    return {"upload_id":upload_id,"status":"queued_for_local_extraction"}
