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

    //Update the statistics counter on the Dashboard(patients)
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
            <button class="action-btn" onclick="viewPatient(${patient.id})">
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

  document.getElementById('deletePatientBtn').onclick = () =>
    deletePatient(patient.id);
  document.getElementById('viewPatientDialog').showModal();

  loadVisits(patient.id);

  document.getElementById('addVisitBtn').onclick = () => addVisit(patient.id);
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

async function saveEditedPatient() {
  const id = document.getElementById('editPatientId').value;
  const name = document.getElementById('editPatientName').value.trim();
  const phone = document.getElementById('editPatientPhone').value.trim();
  const nameError = document.getElementById('editNameError');

  if (!name) {
    nameError.textContent = 'Please give name';
    nameError.style.display = 'block';
    return;
  } else {
    nameError.style.display = 'none';
  }

  try {
    const res = await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ full_name: name, phone: phone }),
    });

    if (res.ok) {
      document.getElementById('editPatientDialog').close();
      searchPatients();
    }
  } catch (error) {
    console.error('error updating patient:', error);
  }
}

document
  .getElementById('saveEditBtn')
  .addEventListener('click', saveEditedPatient);

async function loadVisits(patientId) {
  const res = await fetch(`/api/patients/${patientId}/visits`);
  const visits = await res.json();

  const container = document.getElementById('visitsList');
  container.innerHTML = '';
  if (visits.length === 0) {
    container.innerHTML = '<p>No visits recorded yet</p>';
  } else {
    visits.forEach((visit) => {
      const item = document.createElement('div');
      item.className = 'visit-card';

      item.innerHTML = `
          <div><strong>Date:</strong> ${visit.visit_date}</div>
          <div><strong>Diagnosis:</strong> ${visit.diagnosis}</div>
          <div><strong>Notes:</strong> ${visit.notes || '-'}</div>
          <button type="button" class="delete-visit-btn" onclick="deleteVisit(${visit.id}, ${patientId})">Delete</button>
      `;
      container.appendChild(item);
    });
  }
}

async function deleteVisit(visitId, patientId) {
  const confirmed = confirm('Are you sure you want to delete this visit?');
  if (!confirmed) return;

  const res = await fetch(`/api/visits/${visitId}`, {
    method: 'DELETE',
  });

  if (res.ok) {
    loadVisits(patientId);
  } else {
    alert('Failed to delete visit.');
  }
}
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
      body: JSON.stringify({ full_name: name, phone: phone }),
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

async function deletePatient(id) {
  const confirmed = confirm('You want to delete this patient? ');
  if (!confirmed) return;

  try {
    const resp = await fetch(`/api/patients/${id}`, {
      method: 'DELETE',
    });

    if (resp.ok) {
      document.getElementById('viewPatientDialog').close();
      searchPatients();
    }
  } catch (error) {
    console.error('Error deleting patient:', error);
  }
}

async function addVisit(patientId) {
  const visit_date = document.getElementById('visitDate').value;
  const diagnosis = document.getElementById('visitDiagnosis').value;
  const notes = document.getElementById('visitNotes').value;

  try {
    const resp = await fetch(`/api/patients/${patientId}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visit_date, diagnosis, notes }),
    });
    if (resp.ok) {
      document.getElementById('visitDate').value = '';
      document.getElementById('visitDiagnosis').value = '';
      document.getElementById('visitNotes').value = '';

      loadVisits(patientId);
    }
  } catch (error) {
    console.error('Error adding visit:', error);
  }
}

/* NAVIGATION & VIEW SWITCHING */

//Switch visible container and navigation state between Dashboard and Patients
function switchView(viewName) {
  const dashboard = document.getElementById('viewDashboard');
  const patients = document.getElementById('viewPatients');
  const btnDashboard = document.getElementById('navDashboard');
  const btnPatients = document.getElementById('navPatients');
  const staff = document.getElementById('viewStaff');
  const btnStaff = document.getElementById('navStaff');

  if (viewName === 'dashboard') {
    if (dashboard) dashboard.style.display = 'block';
    if (patients) patients.style.display = 'none';
    if (btnDashboard) btnDashboard.classList.add('active');
    if (btnPatients) btnPatients.classList.remove('active');
    if (staff) staff.style.display = 'none';
    if (btnStaff) btnStaff.classList.remove('active');
  } else if (viewName === 'patients') {
    if (dashboard) dashboard.style.display = 'none';
    if (patients) patients.style.display = 'block';
    if (btnPatients) btnPatients.classList.add('active');
    if (btnDashboard) btnDashboard.classList.remove('active');
    if (staff) staff.style.display = 'none';
    if (btnStaff) btnStaff.classList.remove('active');
    searchPatients();
  } else if (viewName === 'staff') {
    if (dashboard) dashboard.style.display = 'none';
    if (patients) patients.style.display = 'none';
    if (staff) staff.style.display = 'block';
    if (btnDashboard) btnDashboard.classList.remove('active');
    if (btnPatients) btnPatients.classList.remove('active');
    if (btnStaff) btnStaff.classList.add('active');
    loadStaff();
  }
}

/* APPLICATION INITIALIZATION */

//Automatically load all patients on startup
window.addEventListener('DOMContentLoaded', () => {
  searchPatients();
});

/* STAFF MANAGEMENT */

async function loadStaff() {
  const container = document.getElementById('staffContainer');

  try {
    const response = await fetch('/api/staff');
    const staffList = await response.json();

    //Update the statistics counter on the dashboard(staff)
    const statStaff = document.getElementById('statStaffCount');
    if (statStaff) {
      statStaff.innerText = staffList.length;
    }

    //Clear and populate the staff list container
    if (container) {
      container.innerHTML = '';

      if (staffList.length === 0) {
        container.innerHTML = `<p style="color: #64748b; padding: 12px;">No staff members found.</p>`;
        return;
      }

      staffList.forEach((staff) => {
        const card = document.createElement('div');
        card.className = 'patient-card';
        card.innerHTML = `
          <div>
            <div class="patient-name">${staff.full_name}</div>
            <div class="patient-meta">Specialty: ${staff.specialty || '-'} | Phone: ${staff.phone || '-'}</div>
          </div>
          <div>
            <button class="action-btn" onclick="openEditStaffModal(${staff.id}, '${staff.full_name}', '${staff.specialty || ''}', '${staff.phone || ''}')">Edit</button>
            <button class="action-btn" onclick="deleteStaff(${staff.id})">Delete</button>
          </div>
          `;
        container.appendChild(card);
      });
    }
  } catch (error) {
    console.error('Error fetching staff:', error);
  }
}

function openStaffModal() {
  const dialog = document.getElementById('staffDialog');
  if (dialog) {
    dialog.showModal();
  } else {
    console.error("No item found with id 'staffDialog'");
  }
}

function closeStaffModal() {
  const dialog = document.getElementById('staffDialog');
  if (dialog) {
    dialog.close();
    document.getElementById('staffName').value = '';
    document.getElementById('staffSpecialty').value = '';
    document.getElementById('staffPhone').value = '';
  }
}

async function saveStaff() {
  const name = document.getElementById('staffName').value.trim();
  const specialty = document.getElementById('staffSpecialty').value.trim();
  const phone = document.getElementById('staffPhone').value.trim();
  const nameError = document.getElementById('staffNameError');

  if (!name) {
    if (nameError) {
      nameError.textContent = 'Please give name';
      nameError.style.display = 'block';
    }
    return;
  } else {
    if (nameError) nameError.style.display = 'none';
  }

  const resp = await fetch('/api/staff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: name,
      specialty: specialty,
      phone: phone,
    }),
  });
  if (resp.ok) {
    closeStaffModal();
    loadStaff();
  }
}

async function deleteStaff(id) {
  const confirmed = confirm(
    'Are you sure you want to delete this staff member?',
  );
  if (!confirmed) return;

  try {
    const resp = await fetch(`/api/staff/${id}`, {
      method: 'DELETE',
    });
    if (resp.ok) {
      loadStaff();
    }
  } catch (error) {
    console.error('Error deleting staff:', error);
  }
}

function openEditStaffModal(id, name, specialty, phone) {
  document.getElementById('editStaffId').value = id;
  document.getElementById('editStaffName').value = name;
  document.getElementById('editStaffSpecialty').value = specialty;
  document.getElementById('editStaffPhone').value = phone;
  document.getElementById('editStaffNameError').style.display = 'none';

  document.getElementById('editStaffDialog').showModal();
}

async function saveEditedStaff() {
  const id = document.getElementById('editStaffId').value;
  const name = document.getElementById('editStaffName').value.trim();
  const specialty = document.getElementById('editStaffSpecialty').value.trim();
  const phone = document.getElementById('editStaffPhone').value.trim();
  const nameError = document.getElementById('editStaffNameError');

  if (!name) {
    if (nameError) {
      nameError.textContent = 'Please give name';
      nameError.style.display = 'block';
    }
    return;
  } else {
    if (nameError) nameError.style.display = 'none';
  }

  try {
    const resp = await fetch(`/api/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: name,
        specialty: specialty,
        phone: phone,
      }),
    });

    if (resp.ok) {
      document.getElementById('editStaffDialog').close();
      loadStaff();
    } else {
      alert('Error updating staff member');
    }
  } catch (error) {
    console.error('Error updating staff:', error);
  }
}

document
  .getElementById('saveEditStaffBtn')
  .addEventListener('click', saveEditedStaff);

document.getElementById('cancelStaffEditBtn').addEventListener('click', () => {
  document.getElementById('editStaffDialog').close();
});

window.addEventListener('DOMContentLoaded', () => {
  searchPatients();
  loadStaff(); //Updates statStaffCount
});
