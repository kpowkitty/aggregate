'use strict';

function landingClick(action) {
    if (action === 'login') {
        console.log('Login clicked');
        window.location.href = "/login";
    } else if (action === 'create') {
        console.log('Create account clicked');
        window.location.href = "/create";
    }
}

function validateForm(event) {
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    event.preventDefault(); // Prevent form submission
    return false;
  }
  if (password.length < 8) {
    alert('Password must be at least 8 characters long!');
    event.preventDefault(); // Prevent form submission
    return false;
  }
  return true; // Allow form submission
}

function handleCreateAccount(event) {
  // Stub until we get to deeper javascript and backend
  event.preventDefault();
  console.log('Account creation:', { email });
  window.location.href = '/profile';
}

// xxx do we need async here?
document.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/transactions/chart-data');
  const data = await res.json();

  const ctx = document.getElementById('spendingChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Spending',
        data: data.values,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

	/* Create account form listener: */
	const form = document.getElementById('create-account-form');
  if (form) {
    form.addEventListener('submit', validateForm);
  }
});

// vim: set ts=2 sw=2 sts=2 noet filetype=javascript:
