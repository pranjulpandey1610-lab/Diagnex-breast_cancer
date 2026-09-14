# IDC Histopathology Patch Baseline — `idc_patch_sgd_v1`

## Status

Research-only baseline. It is restricted to Admin and Researcher access and is never available to patients.

## Intended use

This model produces a research annotation score for a single public-dataset-style, 50×50 H&E histopathology PNG patch. It is not designed for whole-slide pathology, DICOM imaging, mammogram, breast ultrasound, MRI, uploaded reports, photographs, symptom text, or patient-level conclusions.

## Data and split

The model was trained from the downloaded `IDC_regular_ps50_idx5` dataset. Its 277,524 patches were partitioned by source subject (279 subjects), with no subject represented in more than one train, validation, or test partition.

## Held-out test results

- Sensitivity: 0.805
- Specificity: 0.644
- Precision: 0.435
- F1: 0.565
- ROC-AUC: 0.810
- PR-AUC: 0.589
- False negatives: 2,142
- False positives: 11,482

The full calibration curve and confusion matrix are in `metrics.json`.

## Limitations and safeguards

- A single public source was used; there is no external test set.
- Patch labels are source annotations and do not establish a patient-level conclusion.
- Calibration is insufficient for clinical use.
- Research analysis is not a diagnosis. Qualified pathology interpretation is required.
- Patient reports, patient chats, patient scans, and patient uploads are never used to train this model automatically.
