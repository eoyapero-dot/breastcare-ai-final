-- database_setup.sql

CREATE DATABASE IF NOT EXISTS breast_cancer_db;
USE breast_cancer_db;

-- 1. Users Table (Healthcare Practitioners & Admins) [cite: 354]
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Clinician', 'Admin') NOT NULL DEFAULT 'Clinician',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patients Table (Demographics) [cite: 398]
CREATE TABLE IF NOT EXISTS patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    parity INT DEFAULT 0, -- Number of births
    location_type ENUM('Rural', 'Urban'),
    socio_economic_status ENUM('Low', 'Middle', 'High'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Risk Scores Table (History of predictions) [cite: 430]
CREATE TABLE IF NOT EXISTS risk_scores (
    score_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    risk_probability FLOAT, -- 0.0 to 1.0
    risk_level ENUM('Low', 'Moderate', 'High'),
    model_version VARCHAR(50),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- 4. Imaging Logs (For the new feature you requested)
CREATE TABLE IF NOT EXISTS imaging_logs (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    image_path VARCHAR(255),
    ai_prediction_result VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- Insert a dummy user to test login later
INSERT INTO users (username, password_hash, role) VALUES ('doctor1', 'hashed_secret_password', 'Clinician');