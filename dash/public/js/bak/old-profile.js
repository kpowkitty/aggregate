// Toggle between table and chart view
const toggleSwitch = document.getElementById('toggle-view');
const tableContainer = document.querySelector('.table-container');
const chartContainer = document.querySelector('.chart-container');

<% if (currprof && trans && trans.length > 0) { %>
  const ctx = document.getElementById('transactions-chart').getContext('2d');
  let isTableView = true;

  // Process transaction data for chart
  const merchantData = {};
  <% trans.forEach(transaction => { %>
    const merchant = '<%= transaction.merchant_name || transaction.name || "Unknown" %>';
    const amount = <%= Math.abs(transaction.amount) %>;
    if (merchantData[merchant]) {
      merchantData[merchant] += amount;
    } else {
      merchantData[merchant] = amount;
    }
  <% }); %>

  const merchants = Object.keys(merchantData);
  const amounts = merchants.map(merchant => merchantData[merchant]);

  // Create random colors for the chart
  function getRandomColors(count) {
    const colors = [];
    const hoverColors = [];
    
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      
      colors.push(`rgba(${r}, ${g}, ${b}, 0.8)`);
      hoverColors.push(`rgba(${r}, ${g}, ${b}, 1)`);
    }
    
    return { colors, hoverColors };
  }

  const { colors, hoverColors } = getRandomColors(merchants.length);

  const transactionData = {
    labels: merchants,
    datasets: [{
      label: 'Money Spent at Vendor',
      data: amounts,
      backgroundColor: colors,
      hoverBackgroundColor: hoverColors
    }]
  };

  let pieChart;

  if (toggleSwitch) {
    toggleSwitch.addEventListener('change', () => {
      if (isTableView) {
        tableContainer.style.display = 'none';
        chartContainer.style.display = 'block';

        // Render the pie chart if it doesn't exist
        if (!pieChart) {
          pieChart = new Chart(ctx, {
            type: 'pie',
            data: transactionData,
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${context.label}: $${context.raw.toFixed(2)}`;
                    }
                  }
                }
              },
            },
          });
        }
      } else {
        tableContainer.style.display = 'block';
        chartContainer.style.display = 'none';
      }
      isTableView = !isTableView;
    });
  }
<% } %>

const overlay = document.getElementById('overlay');

	// Profile management
	const addProfileButton = document.getElementById('add-profile-button');
	const newProfileMenu = document.getElementById('new-profile-menu');
	const closeNewProfileMenuButton = document.getElementById('close-new-profile-menu');
	const saveProfileButton = document.getElementById('save-profile-button');
	const createFirstProfileButton = document.getElementById('create-first-profile');
	
	function openProfileModal() {
	  newProfileMenu.classList.remove('hidden');
	  overlay.classList.remove('hidden');
	}
	
	if (addProfileButton) {
	  addProfileButton.addEventListener('click', openProfileModal);
	}
	
	if (createFirstProfileButton) {
	  createFirstProfileButton.addEventListener('click', openProfileModal); // Fixed: Added closing parenthesis
	} // Fixed: Added closing curly brace
	
	if (closeNewProfileMenuButton) {
	  closeNewProfileMenuButton.addEventListener('click', () => {
	    newProfileMenu.classList.add('hidden');
	    overlay.classList.add('hidden');
	  });
	}
	
	if (saveProfileButton) {
	  saveProfileButton.addEventListener('click', () => {
	    const profileName = document.getElementById('profile-name').value.trim();
	    
	    if (profileName) {
	      // Send the data to the server
	      fetch('/api/profiles/create', {
	        method: 'POST',
	        headers: {
	          'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({ name: profileName }),
	      })
	      .then(response => response.json())
	      .then(data => {
	        if (data.success) {
	          // Redirect to the new profile page
	          window.location.href = `/profile/${data.profileId}`;
	        }
	      })
	      .catch(error => console.error('Error creating profile:', error));
	    }
	  });
	}
	
	// Check if account is connected - this code now executes properly
	fetch('/api/is_account_connected')
	  .then(response => response.json())
	  .then(data => {
	    if (!data.status) {
	      const linkBankButton = document.createElement('button');
	      linkBankButton.textContent = 'Connect a Bank Account';
	      linkBankButton.className = 'link-bank-button';
	      linkBankButton.addEventListener('click', () => {
	        window.location.href = '/linkBank';
	      });
	
	      const settings = document.querySelector('.settings');
	      if (settings) {
	        // Only add button once instead of four times
	        settings.prepend(linkBankButton);
	      }
	    }
	  })
	  .catch(err => console.error('Error checking account connection:', err));

