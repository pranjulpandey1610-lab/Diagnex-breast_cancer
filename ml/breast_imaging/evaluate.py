from __future__ import annotations
import numpy as np
from sklearn.metrics import average_precision_score, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score
def metrics(y,prob,groups=None):
 y=np.asarray(y);p=np.asarray(prob);pred=(p>=.5).astype(int);tn,fp,fn,tp=confusion_matrix(y,pred,labels=[0,1]).ravel()
 result={"sensitivity":float(recall_score(y,pred,zero_division=0)),"specificity":float(tn/(tn+fp)) if tn+fp else 0,"precision":float(precision_score(y,pred,zero_division=0)),"recall":float(recall_score(y,pred,zero_division=0)),"f1":float(f1_score(y,pred,zero_division=0)),"roc_auc":float(roc_auc_score(y,p)),"pr_auc":float(average_precision_score(y,p)),"false_negative_rate":float(fn/(fn+tp)) if fn+tp else 0,"false_positive_rate":float(fp/(fp+tn)) if fp+tn else 0,"error_indices":{"false_negative":np.where((y==1)&(pred==0))[0].tolist(),"false_positive":np.where((y==0)&(pred==1))[0].tolist()}}
 if groups is not None: result["subgroup_performance"]={str(g):metrics(y[np.array(groups)==g],p[np.array(groups)==g]) for g in set(groups) if len(set(y[np.array(groups)==g]))>1}
 return result
