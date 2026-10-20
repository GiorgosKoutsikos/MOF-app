import sqlite3

DB_NAME = "lon.db"

def get_connection():
    conn = sqlite3.connect(DB_NAME)
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    cursor.execute("""
                  CREATE TABLE IF NOT EXISTS patients (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    full_name TEXT NOT NULL,
                    amka TEXT UNIQUE NOT NULL,
                    phone TEXT
                  );
                """)

    cursor.execute("""
                  CREATE TABLE IF NOT EXISTS visits (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patient_id INTEGER NOT NULL,
                    visit_date TEXT NOT NULL,
                    diagnosis TEXT NOT NULL,
                    notes TEXT,
                    FOREIGN KEY (patient_id) REFERENCES patients (id)
                    );
                """)


    conn.commit()
    conn.close()
