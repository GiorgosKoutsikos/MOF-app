import sqlite3

DB_NAME = "mof.db"

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


def add_patient(full_name, amka, phone):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("INSERT INTO patients(full_name, amka, phone) VALUES(?, ?, ?)", (full_name, amka, phone))

    conn.commit()
    conn.close()



if __name__ == "__main__":
    init_db()
    add_patient("Γιώργος Παπαδόπουλος", "12345678901", "6900000000")
    print("Ο ασθενής προστέθηκε επιτυχώς!")
