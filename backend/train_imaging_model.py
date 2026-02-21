import os
import numpy as np
import joblib
from PIL import Image
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 1. SETUP PATHS
base_dir = os.path.dirname(os.path.abspath(__file__))
dataset_dir = os.path.join(base_dir, 'dataset', 'train') # We use 'train' for everything and split it manually

if not os.path.exists(dataset_dir):
    print("❌ ERROR: Dataset folder not found!")
    exit()

print("✅ Loading images for Scikit-Learn training...")

# 2. LOAD AND PROCESS IMAGES
X = [] # Image data
y = [] # Labels (0=Benign, 1=Malignant)

categories = ['benign', 'malignant']

for label, category in enumerate(categories):
    folder_path = os.path.join(dataset_dir, category)
    if not os.path.exists(folder_path):
        print(f"⚠️ Warning: Folder {category} not found. Skipping.")
        continue
        
    for filename in os.listdir(folder_path):
        if filename.endswith(('.png', '.jpg', '.jpeg')):
            img_path = os.path.join(folder_path, filename)
            try:
                # Open image, convert to Greyscale (L), resize to 64x64 for speed
                img = Image.open(img_path).convert('L').resize((64, 64))
                # Convert to number array and FLATTEN it (make it a single list of numbers)
                img_array = np.array(img).flatten()
                
                X.append(img_array)
                y.append(label)
            except Exception as e:
                print(f"Error reading {filename}: {e}")

X = np.array(X)
y = np.array(y)

print(f"📊 Loaded {len(X)} images successfully.")

if len(X) == 0:
    print("❌ No images found. Check your folder structure!")
    exit()

# 3. TRAIN MODEL
# Split into training and testing
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("🚀 Training Random Forest Vision Model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 4. EVALUATE
y_pred = model.predict(X_test)
print(f"🎯 Model Accuracy: {accuracy_score(y_test, y_pred)*100:.2f}%")

# 5. SAVE
joblib.dump(model, 'breast_cancer_vision.pkl')
print("✅ Vision Model saved as 'breast_cancer_vision.pkl'")