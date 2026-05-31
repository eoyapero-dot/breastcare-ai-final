import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib

# 1. Load the dataset
df = pd.read_csv('brca_tcga_clinical_data (1).tsv', sep='\t')

# 2. Select ALL Comprehensive Features
features = [
    'Diagnosis Age', 
    'Menopause Status', 
    'Neoplasm Disease Stage American Joint Committee on Cancer Code',
    'ER Status By IHC', 
    'PR status by ihc', 
    'HER2 fish status',
    'Neoplasm Histologic Type Name',
    'Race Category',
    'Prior Cancer Diagnosis Occurence',
    'Disease Surgical Margin Status',
    'Lymph Node(s) Examined Number'
]
target = 'Overall Survival Status'

# Filter and clean target
data = df[features + [target]].copy()
data = data.dropna(subset=[target])
data[target] = data[target].apply(lambda x: 1 if 'DECEASED' in str(x).upper() else 0)

X = data[features]
y = data[target]

# 3. Build the Preprocessing Pipeline for all features
numeric_features = ['Diagnosis Age', 'Lymph Node(s) Examined Number']
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_features = [
    'Menopause Status', 'Neoplasm Disease Stage American Joint Committee on Cancer Code',
    'ER Status By IHC', 'PR status by ihc', 'HER2 fish status', 
    'Neoplasm Histologic Type Name', 'Race Category', 
    'Prior Cancer Diagnosis Occurence', 'Disease Surgical Margin Status'
]
categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ])

# 4. Create and Train the Model
rf_model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced'))
])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
rf_model.fit(X_train, y_train)

# 5. Save the comprehensive model
joblib.dump(rf_model, 'risk_model_pipeline.pkl')
print("Comprehensive model retrained and saved successfully!")