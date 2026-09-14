"""Research evaluation. Metrics are not diagnostic claims."""
from __future__ import annotations
import numpy as np
from sklearn.calibration import calibration_curve
from sklearn.metrics import average_precision_score, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score

def evaluate_binary(y_true, probabilities, threshold: float = .5) -> dict:
    y_true=np.asarray(y_true); p=np.asarray(probabilities); pred=(p>=threshold).astype(int)
    tn,fp,fn,tp=confusion_matrix(y_true,pred,labels=[0,1]).ravel()
    frac_pos, mean_pred=calibration_curve(y_true,p,n_bins=10)
    return {"sensitivity_recall":float(recall_score(y_true,pred,zero_division=0)),"specificity":float(tn/(tn+fp)) if tn+fp else 0.,"precision":float(precision_score(y_true,pred,zero_division=0)),"f1":float(f1_score(y_true,pred,zero_division=0)),"roc_auc":float(roc_auc_score(y_true,p)),"pr_auc":float(average_precision_score(y_true,p)),"confusion_matrix":{"tn":int(tn),"fp":int(fp),"fn":int(fn),"tp":int(tp)},"calibration_curve":{"mean_predicted":mean_pred.tolist(),"fraction_positive":frac_pos.tolist()},"false_negative_analysis":{"count":int(fn),"row_indices":np.where((y_true==1)&(pred==0))[0].tolist()},"false_positive_analysis":{"count":int(fp),"row_indices":np.where((y_true==0)&(pred==1))[0].tolist()}}
