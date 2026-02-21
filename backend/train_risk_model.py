import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score

# 1. GENERATE DATA (10 Features)
print("📊 Generating comprehensive patient dataset...")
np.random.seed(42)
n_samples = 2000

data = pd.DataFrame({
    'age': np.random.randint(18, 90, n_samples),
    'location': np.random.choice([0, 1], n_samples), # 0=Urban, 1=Rural
    'parity': np.random.randint(0, 8, n_samples),
    'history': np.random.choice([0, 1], n_samples, p=[0.75, 0.25]),
    'comorbidities': np.random.randint(0, 4, n_samples),
    'education': np.random.choice([0, 1, 2, 3], n_samples),
    'employment': np.random.choice([0, 1, 2, 3], n_samples),
    'insurance': np.random.choice([0, 1, 2], n_samples),
    'distance': np.random.choice([0, 1, 2, 3], n_samples),
    'transport': np.random.choice([0, 1, 2, 3], n_samples),
})

# 2. DEFINE RISK RULES (Simulation)
def calculate_risk(row):
    score = 0
    if row['location'] == 1: score += 2
    if row['distance'] >= 2: score += 2
    if row['insurance'] == 0: score += 2
    if row['age'] > 60: score += 1
    score += np.random.normal(0, 1.5)
    return 1 if score > 4.5 else 0

data['delayed_diagnosis'] = data.apply(calculate_risk, axis=1)

# 3. TRAIN
X = data.drop('delayed_diagnosis', axis=1)
y = data['delayed_diagnosis']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

model = RandomForestClassifier()
print("🚀 Training Model...")
model.fit(X_train, y_train)

# 4. SAVE
joblib.dump(model, 'risk_model.pkl')
print(f"✅ Model saved as 'risk_model.pkl' with accuracy: {accuracy_score(y_test, model.predict(X_test)):.2f}")