-- database_setup.sql

CREATE DATABASE IF NOT EXISTS breast_cancer_db;
USE breast_cancer_db;

-- Clear out the old tables to prevent conflicts with the new architecture
DROP TABLE IF EXISTS imaging_logs;
DROP TABLE IF EXISTS risk_scores;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS users;

-- 1. Users Table (Healthcare Practitioners & Admins)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Clinician', 'Admin') NOT NULL DEFAULT 'Clinician',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patients Table (Comprehensive TCGA Demographics & Clinical Data)
-- This perfectly matches your new React Form and Flask backend
CREATE TABLE IF NOT EXISTS patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(100) NOT NULL, -- Replaces first_name/last_name for easier form input
    diagnosis_age INT,
    race_category VARCHAR(50),
    menopause_status VARCHAR(50),
    prior_cancer VARCHAR(20),
    histology_type VARCHAR(100),
    tumor_stage VARCHAR(50),
    er_status VARCHAR(50),
    pr_status VARCHAR(50),
    her2_status VARCHAR(50),
    margin_status VARCHAR(50),
    lymph_nodes_examined INT,
    risk_score VARCHAR(50), -- Saving the AI output directly to the patient profile for the Registry Table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Risk Scores Table (Optional: If you want to track a history of predictions over time)
CREATE TABLE IF NOT EXISTS risk_scores (
    score_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    risk_probability FLOAT, -- 0.0 to 1.0 (if you want to save the raw decimal)
    risk_level VARCHAR(50), -- 'Low Risk' or 'High Risk'
    model_version VARCHAR(50) DEFAULT 'TCGA_RandomForest_v1',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- 4. Imaging Logs (For the CNN Ultrasound/Mammogram feature)
CREATE TABLE IF NOT EXISTS imaging_logs (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    image_path VARCHAR(255),
    ai_prediction_result VARCHAR(255),
    confidence_score FLOAT, -- Added this so you can display the CNN's confidence % later
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Insert a dummy user to test login later
INSERT INTO users (username, password_hash, role) VALUES ('doctor1', 'hashed_secret_password', 'Clinician');