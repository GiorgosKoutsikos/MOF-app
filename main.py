from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import database

#Initialization of tables in the database
database.init_db()

app = FastAPI(title="MOF - Physiotherapy Clinic Manager")

#Serving the static folder (style.css & app.js)
app.mount("/static", StaticFiles(directory="static"), name="static")

#Root route: serves index.html
@app.get("/")
def serve_home():
    return FileResponse("index.html")

#API endpoint for searching patients
@app.get("/api/patients")
def get_patients(q: str = ""):
    return database.search_patients(q)

class PatientCreate(BaseModel):
    full_name: str
    phone: str

@app.post("/api/patients")
def add_patient(patient: PatientCreate):
    new_id = database.add_patient(patient.full_name, patient.phone)
    return {
        "id": new_id,
        "full_name": patient.full_name,
        "phone": patient.phone
    }

@app.get("/api/patients/{patient_id}")
def get_patient(patient_id: int):
    patient = database.get_patient_by_id(patient_id)
    if patient:
        return patient
    raise HTTPException(status_code=404, detail="Patient not found")

class PatientUpdate(BaseModel):
    full_name: str
    phone: str

@app.put("/api/patients/{patient_id}")
def update_patient_endpoint(patient_id: int, patient_data: PatientUpdate):
    database.update_patient(patient_id, patient_data.full_name, patient_data.phone)
    return {"message": "Patient updated successfully"}

@app.delete("/api/patients/{patient_id}")
def delete_patient(patient_id: int):
    database.delete_patient(patient_id)
    return {"message": "Patient deleted successfully"}

@app.get("/api/patients/{patient_id}/visits")
def get_patient_visits(patient_id: int):
    return database.get_patients_visits(patient_id)

class VisitCreate(BaseModel):
    visit_date: str
    diagnosis: str
    notes: str = ""

@app.post("/api/patients/{patient_id}/visits")
def add_visit(patient_id: int, visit: VisitCreate):
    database.add_visit(patient_id, visit.visit_date, visit.diagnosis, visit.notes)
    return {"message": "Patient visit added succesfully"}

@app.delete("/api/visits/{visit_id}")
def delete_visit(visit_id: int):
    result = database.delete_visit(visit_id)
    if not result:
        raise HTTPException(status_code=404, detail="Visit not found")
    return {"message": "Patient visit deleted successfully"}

@app.get("/api/staff")
def get_staff():
    return [dict(s) for s in database.get_all_staff()]
