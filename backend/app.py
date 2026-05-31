from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import numpy as np
import pandas as pd # Required for the new Scikit-Learn Pipeline
from PIL import Image
import mysql.connector
import time

app = Flask(__name__)
CORS(app)

# Ensure upload folder exists
if not os.path.exists('uploads'):
    os.makedirs('uploads')

# --- DATABASE HELPER ---
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="", # Update if you have a password in XAMPP
        database="breast_cancer_db"
    )

# --- LOAD AI MODELS ---
try:
    # Changed to the new pipeline model
    risk_model = joblib.load('risk_model_pipeline.pkl')
    print("✅ Comprehensive Risk Model Pipeline loaded.")
except Exception as e:
    print(f"⚠️ Risk Model missing or error: {e} (Using simulation).")
    risk_model = None

try:
    vision_model = joblib.load('breast_cancer_vision.pkl')
    print("✅ Vision Model loaded.")
except:
    print("⚠️ Vision Model missing (Using simulation).")
    vision_model = None


@app.route('/')
def home():
    return "BreastCare AI System - TCGA Integrated - All Systems Operational"

# ==========================================
# FEATURE 1: RISK ASSESSMENT (COMPREHENSIVE)
# ==========================================
@app.route('/predict_risk', methods=['POST'])
def predict_risk():
    try:
        data = request.json
        
        # 1. Format for ML Pipeline (Mapping frontend JSON to exact TSV Training columns)
        df_input = pd.DataFrame({
            'Diagnosis Age': [int(data.get('diagnosis_age', 50))],
            'Menopause Status': [data.get('menopause_status', 'Post')],
            'Neoplasm Disease Stage American Joint Committee on Cancer Code': [data.get('tumor_stage', 'Stage IIA')],
            'ER Status By IHC': [data.get('er_status', 'Positive')],
            'PR status by ihc': [data.get('pr_status', 'Positive')],
            'HER2 fish status': [data.get('her2_status', 'Negative')],
            'Neoplasm Histologic Type Name': [data.get('histology_type', 'Infiltrating Ductal Carcinoma')],
            'Race Category': [data.get('race_category', 'WHITE')],
            'Prior Cancer Diagnosis Occurence': [data.get('prior_cancer', 'No')],
            'Disease Surgical Margin Status': [data.get('margin_status', 'Negative')],
            'Lymph Node(s) Examined Number': [int(data.get('lymph_nodes_examined', 0))]
        })

        # 2. Get Prediction
        if risk_model:
            prediction = risk_model.predict(df_input)[0]
            probability = risk_model.predict_proba(df_input)[0][1]
        else:
            prediction = 1
            probability = 0.85 # Fallback simulation

        risk_level = "High Risk" if prediction == 1 else "Low Risk"

        # 3. Save to the NEW patients table
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """INSERT INTO patients 
                 (patient_name, diagnosis_age, race_category, menopause_status, prior_cancer, 
                  histology_type, tumor_stage, er_status, pr_status, her2_status, margin_status, 
                  lymph_nodes_examined, risk_score) 
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        val = (
            data.get('name', 'Unknown Patient'),
            data.get('diagnosis_age', 50),
            data.get('race_category', 'WHITE'),
            data.get('menopause_status', 'Post'),
            data.get('prior_cancer', 'No'),
            data.get('histology_type', 'Infiltrating Ductal Carcinoma'),
            data.get('tumor_stage', 'Stage IIA'),
            data.get('er_status', 'Positive'),
            data.get('pr_status', 'Positive'),
            data.get('her2_status', 'Negative'),
            data.get('margin_status', 'Negative'),
            data.get('lymph_nodes_examined', 0),
            risk_level
        )
        cursor.execute(sql, val)
        conn.commit()
        conn.close()
        
        return jsonify({
            "status": "success", 
            "risk_score": risk_level, 
            "risk_probability": round(probability * 100, 1)
        })

    except Exception as e:
        print(f"Error in predict_risk: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ==========================================
# FEATURE 2: IMAGING ANALYSIS
# ==========================================
@app.route('/upload_image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    
    file = request.files['file']
    filename = file.filename
    filepath = os.path.join('uploads', filename)
    file.save(filepath)

    if vision_model:
        try:
            # Preprocess
            img = Image.open(filepath).convert('L').resize((64, 64))
            img_array = np.array(img).flatten().reshape(1, -1)
            # Predict
            prediction = vision_model.predict(img_array)[0] 
            probs = vision_model.predict_proba(img_array)[0]
            
            result = "Malignant" if prediction == 1 else "Benign"
            confidence = round(probs[prediction] * 100, 2)
        except:
            result = "Error"
            confidence = 0
    else:
        # Simulation
        time.sleep(1)
        result = "Malignant"
        confidence = 94.5

    return jsonify({
        "prediction": result,
        "confidence": confidence, # Passing as raw float to DB
        "filename": filename
    })

@app.route('/save_imaging', methods=['POST'])
def save_imaging():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Updated to match new `imaging_logs` table schema
        query = "INSERT INTO imaging_logs (image_path, ai_prediction_result, confidence_score) VALUES (%s, %s, %s)"
        
        # Clean the confidence score in case the frontend sends a string like "94.5%"
        conf_str = str(data.get('confidence', '0')).replace('%', '')
        confidence_score = float(conf_str)
        
        cursor.execute(query, (data.get('filename', 'unknown.jpg'), data.get('prediction'), confidence_score))
        conn.commit()
        conn.close()
        return jsonify({"message": "Saved successfully!"})
    except Exception as e:
        print(f"Error in save_imaging: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ==========================================
# FEATURE 3: DASHBOARD HISTORY
# ==========================================
@app.route('/patients', methods=['GET'])
def get_patients():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Updated to query the new table names and proper timestamp column
        cursor.execute("SELECT * FROM patients ORDER BY created_at DESC")
        risk_records = cursor.fetchall()
        
        cursor.execute("SELECT * FROM imaging_logs ORDER BY uploaded_at DESC")
        imaging_records = cursor.fetchall()
        
        conn.close()
        return jsonify({"risk": risk_records, "imaging": imaging_records})
    except Exception as e:
        print(f"Error in get_patients: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ==========================================
# FEATURE 4: SYSTEM SETTINGS
# ==========================================
@app.route('/settings', methods=['GET'])
def get_settings():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM user_settings WHERE id = 1")
        settings = cursor.fetchone()
        conn.close()
        
        if settings:
            # Convert 1/0 to true/false for Javascript
            settings['notify_email'] = bool(settings['notify_email'])
            settings['notify_sms'] = bool(settings['notify_sms'])
            settings['high_sensitivity'] = bool(settings['high_sensitivity'])
            settings['auto_retrain'] = bool(settings['auto_retrain'])
            return jsonify(settings)
        else:
            return jsonify({"error": "No settings found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/settings', methods=['POST'])
def update_settings():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # We check specific keys to know what to update
        if 'first_name' in data:
            sql = "UPDATE user_settings SET first_name=%s, last_name=%s, email=%s, bio=%s WHERE id=1"
            val = (data['first_name'], data['last_name'], data['email'], data['bio'])
            cursor.execute(sql, val)
            
        if 'notify_email' in data:
            sql = "UPDATE user_settings SET notify_email=%s, notify_sms=%s WHERE id=1"
            val = (data['notify_email'], data['notify_sms'])
            cursor.execute(sql, val)
            
        if 'high_sensitivity' in data:
            sql = "UPDATE user_settings SET high_sensitivity=%s, auto_retrain=%s WHERE id=1"
            val = (data['high_sensitivity'], data['auto_retrain'])
            cursor.execute(sql, val)

        conn.commit()
        conn.close()
        return jsonify({"message": "Settings updated successfully!"})
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)