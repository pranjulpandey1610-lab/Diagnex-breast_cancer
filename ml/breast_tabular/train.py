"""Explicit offline trainer for a registered, approved research dataset."""
from __future__ import annotations
import argparse, json
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GroupShuffleSplit, StratifiedKFold, cross_val_score, train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
from preprocess import load_research_data, make_preprocessor
from evaluate import evaluate_binary
from model_registry import export_model, log_experiment, write_model_card

def split(X,y,groups):
    if groups is None: return train_test_split(X,y,test_size=.2,stratify=y,random_state=42)
    train,test=next(GroupShuffleSplit(test_size=.2,n_splits=1,random_state=42).split(X,y,groups)); return X.iloc[train],X.iloc[test],y.iloc[train],y.iloc[test]
def main():
 p=argparse.ArgumentParser();p.add_argument("--csv",required=True);p.add_argument("--label",required=True);p.add_argument("--dataset-id",required=True);p.add_argument("--version",default="v1");p.add_argument("--group-column");p.add_argument("--limitations",default="External validation, subgroup analysis, and prospective evaluation are required.");a=p.parse_args()
 X,y,groups=load_research_data(a.csv,a.label,a.group_column)
 if set(y.unique())-{0,1}: raise ValueError("Binary labels must be encoded 0/1")
 Xtr,Xte,ytr,yte=split(X,y,groups)
 candidates={"logistic_regression":LogisticRegression(max_iter=300),"random_forest":RandomForestClassifier(n_estimators=300,class_weight="balanced",random_state=42),"naive_bayes":GaussianNB(),"support_vector_machine":SVC(probability=True,class_weight="balanced",random_state=42)}
 reports={}; best_name=None; best_score=(-1.,-1.)
 for name,estimator in candidates.items():
  pipe=Pipeline([("preprocess",make_preprocessor(Xtr)),("model",estimator)]); cv=StratifiedKFold(5,shuffle=True,random_state=42); scores=cross_val_score(pipe,Xtr,ytr,cv=cv,scoring="recall");pipe.fit(Xtr,ytr); report=evaluate_binary(yte,pipe.predict_proba(Xte)[:,1]);report["cross_validation_recall_mean"]=float(scores.mean());report["cross_validation_recall_std"]=float(scores.std());reports[name]=report
  score=(report["sensitivity_recall"],report["specificity"])
  if score>best_score: best_name,best_score=name,score;best_pipe=pipe
 selected=reports[best_name];selected["research_only"]=True;selected["selection_basis"]="sensitivity then specificity; calibration and error analyses must be reviewed"
 Path(__file__).with_name("metrics.json").write_text(json.dumps({"selected":best_name,"candidates":reports},indent=2)); path=export_model(best_pipe,a.version,selected);log_experiment({"dataset_id":a.dataset_id,"version":a.version,"selected":best_name,"metrics":selected});write_model_card(a.version,best_name,selected,a.dataset_id,a.limitations);print(json.dumps({"selected":best_name,"model_path":path,"research_only":True},indent=2))
if __name__=="__main__": main()
