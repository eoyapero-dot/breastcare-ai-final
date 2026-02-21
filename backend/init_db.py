import mysql.connector

def init_db():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password=""
        )
        cursor = conn.cursor()

        # 1. Create Database
        cursor.execute("CREATE DATABASE IF NOT EXISTS breast_cancer_db")
        conn.database = "breast_cancer_db"
        print("✅ Database selected.")

        # 2. Table: Patient Risk Records (From Part 1)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS patient_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(100),
                age INT,
                location VARCHAR(50),
                risk_score FLOAT,
                risk_level VARCHAR(20),
                prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ Table 'patient_records' ready.")

        # 3. Table: Imaging Results (From Part 2)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS imaging_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255),
                prediction VARCHAR(50),
                confidence VARCHAR(50),
                scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ Table 'imaging_records' ready.")

        # 4. Table: User Settings (From Part 3 - NEW)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_settings (
                id INT PRIMARY KEY,
                first_name VARCHAR(50),
                last_name VARCHAR(50),
                email VARCHAR(100),
                bio TEXT,
                notify_email BOOLEAN DEFAULT TRUE,
                notify_sms BOOLEAN DEFAULT FALSE,
                high_sensitivity BOOLEAN DEFAULT FALSE,
                auto_retrain BOOLEAN DEFAULT TRUE
            )
        """)
        print("✅ Table 'user_settings' ready.")

        # 5. Create Default Admin User if empty
        cursor.execute("SELECT * FROM user_settings WHERE id = 1")
        if not cursor.fetchone():
            sql = """INSERT INTO user_settings 
                     (id, first_name, last_name, email, bio, notify_email, notify_sms) 
                     VALUES (1, 'Sarah', 'Chen', 'sarah.chen@hospital.com', 'Senior Oncologist', 1, 0)"""
            cursor.execute(sql)
            conn.commit()
            print("✅ Default Admin Profile created.")

        conn.close()
        print("🏆 All Database Tables are synced!")

    except Exception as e:
        print(f"❌ Database Error: {e}")

if __name__ == "__main__":
    init_db()