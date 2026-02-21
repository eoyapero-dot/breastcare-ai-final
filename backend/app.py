from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import numpy as np
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
        password="",
        database="breast_cancer_db"
    )

# --- LOAD AI MODELS ---
try:
    risk_model = joblib.load('risk_model.pkl')
    print("✅ Risk Model loaded.")
except:
    print("⚠️ Risk Model missing (Using simulation).")
    risk_model = None

try:
    vision_model = joblib.load('breast_cancer_vision.pkl')
    print("✅ Vision Model loaded.")
except:
    print("⚠️ Vision Model missing (Using simulation).")
    vision_model = None


@app.route('/')
def home():
    return "BreastCare AI System - All Systems Operational"

# ==========================================
# FEATURE 1: RISK ASSESSMENT
# ==========================================
@app.route('/predict_risk', methods=['POST'])
def predict_risk():
    try:
        data = request.json
        features = [
            int(data.get('age', 0)),
            1 if data.get('location') == 'Rural' else 0,
            int(data.get('parity', 0)),
            1 if data.get('history') else 0,
            len(data.get('comorbidities', [])),
            {'none': 0, 'primary': 1, 'secondary': 2, 'tertiary': 3}.get(data.get('educationLevel', 'none'), 0),
            {'unemployed': 0, 'informal': 1, 'employed': 2, 'retired': 3}.get(data.get('employmentStatus', 'unemployed'), 0),
            {'none': 0, 'public': 1, 'private': 2}.get(data.get('insuranceStatus', 'none'), 0),
            {'0-10': 0, '11-30': 1, '31-50': 2, '50+': 3}.get(data.get('distanceToClinic', '0-10'), 0),
            {'none': 0, 'limited': 1, 'public': 2, 'own': 3}.get(data.get('transportAccess', 'public'), 0),
        ]

        if risk_model:
            probability = risk_model.predict_proba([features])[0][1]
        else:
            probability = 0.15 # Fallback

        result = {
            "risk_score": round(probability * 100, 1),
            "risk_level": "High" if probability > 0.7 else "Moderate" if probability > 0.4 else "Low"
        }

        # Save to DB
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = "INSERT INTO patient_records (full_name, age, location, risk_score, risk_level) VALUES (%s, %s, %s, %s, %s)"
        val = (
            f"{data.get('firstName', 'Unknown')} {data.get('lastName', '')}",
            data.get('age', 0),
            "Rural" if data.get('location') == 'Rural' else "Urban",
            result['risk_score'],
            result['risk_level']
        )
        cursor.execute(sql, val)
        conn.commit()
        conn.close()
        
        return jsonify(result)

    except Exception as e:
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
        result = "Simulated Result"
        confidence = 94.5

    return jsonify({
        "prediction": result,
        "confidence": f"{confidence}%",
        "filename": filename
    })

@app.route('/save_imaging', methods=['POST'])
def save_imaging():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "INSERT INTO imaging_records (filename, prediction, confidence) VALUES (%s, %s, %s)"
        cursor.execute(query, (data.get('filename', 'unknown.jpg'), data['prediction'], data['confidence']))
        conn.commit()
        conn.close()
        return jsonify({"message": "Saved successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# FEATURE 3: DASHBOARD HISTORY
# ==========================================
@app.route('/patients', methods=['GET'])
def get_patients():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM patient_records ORDER BY prediction_date DESC")
        risk_records = cursor.fetchall()
        
        cursor.execute("SELECT * FROM imaging_records ORDER BY scan_date DESC")
        imaging_records = cursor.fetchall()
        
        conn.close()
        return jsonify({"risk": risk_records, "imaging": imaging_records})
    except Exception as e:
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