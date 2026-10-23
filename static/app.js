// Function to fetch and render patients from the backend API
async function searchPatients() {
  const input = document.getElementById('searchInput');
  const query = input ? input.value.trim() : '';
  const container = document.getElementById('patientsContainer');

  try {
    const response = await fetch(
      `/api/patients?q=${encodeURIComponent(query)}`,
    );
    const patients = await response.json();

    // Updating the statistics card on the Dashboard
    const statCount = document.getElementById('statPatientsCount');
    if (statCount) {
      statCount.innerText = patients.length;
    }

    // Clearing and displaying the patient list
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

function viewPatient(id, name) {
  alert(`Selected Patient: ${name} (ID: ${id})`);
}

// Automatically load all patients on startup
window.addEventListener('DOMContentLoaded', () => {
  searchPatients();
});

// Function to switch between Dashboard and Patients views
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
