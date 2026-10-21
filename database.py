import sqlite3

DB_NAME = "mof.db"

def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
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

def search_patient(query):
    conn = get_connection()
    cursor = conn.cursor()

    search_term = f"%{query}%"
    cursor.execute("SELECT * FROM patients WHERE full_name LIKE ? OR amka LIKE ?", (search_term, search_term))

    patients = cursor.fetchall()
    conn.close()
    return patients

def add_visit(patient_id, visit_date, diagnosis, notes=""):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("INSERT INTO visits(patient_id, visit_date, diagnosis, notes) VALUES (?, ?, ?, ?)", (patient_id, visit_date, diagnosis, notes))

    conn.commit()
    conn.close()

def get_patients_visits(patient_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM visits WHERE patient_id = ? ORDER BY id DESC", (patient_id,))

    visits = cursor.fetchall()
    conn.close()
    return visits


if __name__ == "__main__":
    init_db()

    # 1. Βρίσκουμε τον πρώτο ασθενή
    patients = search_patient("")
    if patients:
        pid = patients[0]["id"]

        # 2. Φέρνουμε όλες τις επισκέψεις του
        visits = get_patients_visits(pid)
        print(f"Επισκέψεις για τον ασθενή {patients[0]['full_name']}:")
        for v in visits:
            print(dict(v))
