from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
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
