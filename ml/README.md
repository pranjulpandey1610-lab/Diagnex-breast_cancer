# Approved research data workspace

Only institutionally approved, de-identified research datasets may enter this workspace.
Patient uploads, conversations, breast-awareness sessions, and scan records are prohibited inputs.
This phase validates and documents datasets; it does not train or evaluate a model.

## Offline breast-tabular research pipeline

`breast_tabular/` is an explicit, offline research workflow. It accepts only a
registered, approved, de-identified CSV. It never reads patient uploads, chats,
breast-awareness sessions, or scan records.

After installing backend dependencies, an authorized researcher may run:

```bash
python ml/breast_tabular/train.py \
  --csv ml/data/raw/approved_dataset.csv \
  --label outcome \
  --dataset-id approved-dataset-v1 \
  --group-column research_subject_id \
  --version v1
```

The command compares Logistic Regression, Random Forest, Naive Bayes, and an
SVM using patient/subject-level grouping when supplied. It writes a local
experiment record, model artifact, metrics, and research-only model card. It
does not expose a patient-facing prediction feature.
