from __future__ import annotations
import numpy as np
import pydicom
def load_normalized_pixels(path:str)->np.ndarray:
    ds=pydicom.dcmread(path); pixels=ds.pixel_array.astype("float32")
    if pixels.ndim>2: pixels=pixels[0]
    low,high=np.percentile(pixels,[1,99]); return np.clip((pixels-low)/max(high-low,1e-6),0,1)
def quality_checks(path:str)->dict:
    ds=pydicom.dcmread(path,stop_before_pixels=False);pixels=ds.pixel_array
    return {"has_pixels":bool(pixels.size),"modality":str(getattr(ds,"Modality","")),"rows":int(getattr(ds,"Rows",0)),"columns":int(getattr(ds,"Columns",0)),"photometric_interpretation":str(getattr(ds,"PhotometricInterpretation","")),"orientation_present":bool(getattr(ds,"ImageOrientationPatient",None))}
