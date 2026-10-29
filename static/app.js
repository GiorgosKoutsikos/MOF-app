/* PATIENT DATA FETCHING & RENDERING */

//Fetch and render patients from the backend API based on search query
async function searchPatients() {
  const input = document.getElementById('searchInput');
  const query = input ? input.value.trim() : '';
  const container = document.getElementById('patientsContainer');

  try {
    const response = await fetch(
      `/api/patients?q=${encodeURIComponent(query)}`,
    );
    const patients = await response.json();

    //Update the statistics counter on the Dashboard
    const statCount = document.getElementById('statPatientsCount');
    if (statCount) {
      statCount.innerText = patients.length;
    }

    //Clear and populate the patient list container
    if (container) {
      container.innerHTML = '';

      if (patients.length === 0) {
        container.innerHTML = `<p style="color: #64748b; padding: 12px;">No patients found.</p>`;
        return;
      }

      patients.forEach((patient) => {
        const card = document.createElement('div');
        card.className = 'patient-card';
        card.innerHTML = `
            <div>
                <div class="patient-name">${patient.full_name}</div>
                <div class="patient-meta">Phone: ${patient.phone || '-'}</div>
            </div>
            <button class="action-btn" onclick="viewPatient(${patient.id}, '${patient.full_name}')">
                View Record
            </button>
        `;
        container.appendChild(card);
      });
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
  }
}

/* PATIENT CARD (VIEW MODAL) */

//Fetch details for a specific patient and display them in the View Dialog
async function viewPatient(id) {
  const res = await fetch(`/api/patients/${id}`);
  const patient = await res.json();

  document.getElementById('viewPatientId').textContent = patient.id;
  document.getElementById('viewPatientName').textContent = patient.full_name;
  document.getElementById('viewPatientPhone').textContent =
    patient.phone || '-';

  document.getElementById('viewPatientDialog').showModal();
}

//Close the View Dialog
document.getElementById('closeViewBtn').addEventListener('click', () => {
  document.getElementById('viewPatientDialog').close();
});

/* EDIT PATIENT MODAL */

//Open Edit Dialog pre-filled with data from the View Dialog
document.getElementById('editPatientBtn').addEventListener('click', () => {
  document.getElementById('editPatientId').value =
    document.getElementById('viewPatientId').textContent;

  document.getElementById('editPatientName').value =
    document.getElementById('viewPatientName').textContent;

  document.getElementById('editPatientPhone').value =
    document.getElementById('viewPatientPhone').textContent;

  document.getElementById('viewPatientDialog').close();
  document.getElementById('editPatientDialog').showModal();
});

//Close the Edit Dialog without saving changes
document.getElementById('cancelEditBtn').addEventListener('click', () => {
  document.getElementById('editPatientDialog').close();
});

/* NEW PATIENT MODAL (CREATE) */

//Open modal for creating a new patient
function openPatientModal() {
  const dialog = document.getElementById('patientDialog');
  if (dialog) {
    dialog.showModal();
  } else {
    console.error("No item found with id 'patientDialog'");
  }
}

//Close modal for creating a new patient and reset input fields
function closePatientModal() {
  const dialog = document.getElementById('patientDialog');
  if (dialog) {
    dialog.close();
    document.getElementById('patientName').value = '';
    document.getElementById('patientPhone').value = '';
  }
}

//Submit and persist a new patient to the backend API
async function savePatient() {
  const name = document.getElementById('patientName').value.trim();
  const phone = document.getElementById('patientPhone').value.trim();

  if (!name) {
    alert('Please enter a name!');
    return;
  }

  try {
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: name,
        phone: phone,
      }),
    });

    if (response.ok) {
      closePatientModal();
      searchPatients();
    } else {
      alert('Error while saving');
    }
  } catch (error) {
    console.error('Connection error:', error);
  }
}

/* NAVIGATION & VIEW SWITCHING */

//Switch visible container and navigation state between Dashboard and Patients
function switchView(viewName) {
  const dashboard = document.getElementById('viewDashboard');
  const patients = document.getElementById('viewPatients');
  const btnDashboard = document.getElementById('navDashboard');
  const btnPatients = document.getElementById('navPatients');

  if (viewName === 'dashboard') {
    if (dashboard) dashboard.style.display = 'block';
    if (patients) patients.style.display = 'none';
    if (btnDashboard) btnDashboard.classList.add('active');
    if (btnPatients) btnPatients.classList.remove('active');
  } else if (viewName === 'patients') {
    if (dashboard) dashboard.style.display = 'none';
    if (patients) patients.style.display = 'block';
    if (btnPatients) btnPatients.classList.add('active');
    if (btnDashboard) btnDashboard.classList.remove('active');
    searchPatients();
  }
}

/* APPLICATION INITIALIZATION */

//Automatically load all patients on startup
window.addEventListener('DOMContentLoaded', () => {
  searchPatients();
});
