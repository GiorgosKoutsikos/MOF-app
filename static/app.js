//Function to fetch and render patients from the backend API
async function searchPatients() {
  const input = document.getElementById('searchInput');
  const query = input ? input.value.trim() : '';
  const container = document.getElementById('patientsContainer');

  try {
    const response = await fetch(
      `/api/patients?q=${encodeURIComponent(query)}`,
    );
    const patients = await response.json();

    //Updating the statistics card on the Dashboard
    const statCount = document.getElementById('statPatientsCount');
    if (statCount) {
      statCount.innerText = patients.length;
    }

    //Clearing and displaying the patient list
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

async function viewPatient(id) {
  const res = await fetch(`/api/patients/${id}`);
  const patient = await res.json();

  document.getElementById('viewPatientId').textContent = patient.id;
  document.getElementById('viewPatientName').textContent = patient.full_name;
  document.getElementById('viewPatientPhone').textContent =
    patient.phone || '-';

  document.getElementById('viewPatientDialog').showModal();
}

document.getElementById('closeViewBtn').addEventListener('click', () => {
  document.getElementById('viewPatientDialog').close();
});

//Automatically load all patients on startup
window.addEventListener('DOMContentLoaded', () => {
  searchPatients();
});

//Function to switch between Dashboard and Patients views
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

function openPatientModal() {
  const dialog = document.getElementById('patientDialog');
  if (dialog) {
    dialog.showModal();
  } else {
    console.error("Δεν βρέθηκε στοιχείο με id 'patientDialog'");
  }
}

function closePatientModal() {
  const dialog = document.getElementById('patientDialog');
  if (dialog) {
    dialog.close();
    document.getElementById('patientName').value = '';
    document.getElementById('patientPhone').value = '';
  }
}

async function savePatient() {
  const name = document.getElementById('patientName').value.trim();
  const phone = document.getElementById('patientPhone').value.trim();

  if (!name) {
    alert('Παρακαλώ εισάγετε όνομα!');
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
      alert('Σφάλμα κατά την αποθήκευση.');
    }
  } catch (error) {
    console.error('Σφάλμα σύνδεσης:', error);
  }
}
