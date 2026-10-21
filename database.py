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

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            specialty TEXT,
            phone TEXT
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            staff_id INTEGER NOT NULL,
            session_date TEXT NOT NULL,
            pain_level INTEGER,
            treatment TEXT,
            notes TEXT,
            FOREIGN KEY (patient_id) REFERENCES patients (id),
            FOREIGN KEY (staff_id) REFERENCES staff (id)
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

def add_staff(full_name, specialty, phone):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("INSERT INTO staff(full_name, specialty, phone) VALUES (?, ?, ?)", (full_name, specialty, phone))

    conn.commit()
    conn.close()

def get_all_staff():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM staff ORDER BY full_name ASC")

    staff = cursor.fetchall()
    conn.close()
    return staff

def add_session(patient_id, staff_id, session_date, pain_level, treatment, notes=""):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("INSERT INTO sessions (patient_id, staff_id, session_date, pain_level, treatment, notes) VALUES (?, ?, ?, ?, ?, ?)",
                  (patient_id, staff_id, session_date, pain_level, treatment, notes))

    conn.commit()
    conn.close()

def get_patient_sessions(patient_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT sessions.*, staff.full_name AS therapist_name
        FROM sessions
        JOIN staff ON sessions.staff_id = staff.id
        WHERE sessions.patient_id = ?
        ORDER BY sessions.id DESC
    """, (patient_id,))

    sessions = cursor.fetchall()
    conn.close()
    return sessions

if __name__ == "__main__":
    init_db()
