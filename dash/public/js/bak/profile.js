const toggleSwitch = document.getElementById('toggle-view');
const tableContainer = document.querySelector('.table-container');
const chartContainer = document.querySelector('.chart-container');
const ctx = document.getElementById('transactions-chart').getContext('2d');
let isTableView = true;

const transactionData = {
  labels: ['Store A', 'Gas Station', 'Grocery Store'],
  datasets: [{
    label: 'Money Spent at Vendor',
    data: [50.00, 30.00, 20.00],
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
  }]
};

let pieChart;

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

const addTagButton = document.getElementById('add-tag-button');
const newTagMenu = document.getElementById('new-tag-menu');
const closeNewTagMenuButton = document.getElementById('close-new-tag-menu');
const overlay = document.getElementById('overlay');

addTagButton.addEventListener('click', () => {
  newTagMenu.classList.remove('hidden');
  overlay.classList.remove('hidden');
});

closeNewTagMenuButton.addEventListener('click', () => {
  newTagMenu.classList.add('hidden');
    overlay.classList.add('hidden');
});

// vim: set ts=2 sw=2 sts=2 noet filetype=javascript:
