# Model Card: Breast Health Screening Module

## Model Details
- **Version:** v1.0.0
- **Algorithm:** Random Forest
- **Training Date:** 2026-09-14T10:59:59.557004
- **Dataset Version:** synthetic-breast-v1

## Intended Use
- **Primary Use:** To estimate risk patterns for breast cancer based on structured clinical inputs.
- **Out of Scope:** Definitive diagnosis. 

## Features Used
age, age_at_menarche, age_at_first_birth, history_of_biopsy, family_history_breast_cancer, birads_density_category

## Metrics (Test Set)
- **Accuracy:** 0.8788
- **Precision:** 0.6667
- **Recall (Sensitivity):** 0.7848
- **Specificity:** 0.9022
- **F1 Score:** 0.7209
- **ROC-AUC:** 0.9314
- **PR-AUC:** 0.8434

## Limitations & Ethical Considerations
- This model was trained on synthetic/mock data for demonstration.
- Not validated for clinical use.
- Does not replace professional medical advice.

> **Disclaimer:** SCREENING ESTIMATE ONLY — NOT A DIAGNOSTIC DEVICE.
