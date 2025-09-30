document.addEventListener('DOMContentLoaded', function () {
  /* Sort dropdown: BEGIN */
  // get the sort dropdown element
  const sort = document.getElementById('sort');

  if (sort) {
    // add event listener for when the sort option changes
    sort.addEventListener('change', function () {
      const v = this.value;

      // get the current url and update the sort parameter
      const url = new URL(window.location.href);
      url.searchParams.set('sort', v);

      // navigate to the updated url
      window.location.href = url.toString();
    });
  }
  /* Sort dropdown: END */

  /* Add card: BEGIN */
  const add = document.getElementById('add-card-button');
  if (add) {
    add.addEventListener('click', function () {
      const id = document.getElementById('add-card').value;

      // unhide transactions for the selected card
      const rows = document.querySelectorAll(`tr[data-account-id="${id}"]`);
      rows.forEach(row => {
        row.style.display = '';
      });
    });
  }
  /* Add card: END */

  /* Remove card: BEGIN */
  const remove = document.getElementById('remove-card-button');
  if (remove) {
    remove.addEventListener('click', function () {
      const id = document.getElementById('remove-card').value;

      // hide transactions for the selected card
      const rows = document.querySelectorAll(`tr[data-account-id="${id}"]`);
      rows.forEach(row => {
        row.style.display = 'none';
      });
    });
  }
  /* Remove card: END */

  // Toggle view: BEGIN */
  const toggleSwitch = document.getElementById('toggle-view');
  const tableContainer = document.querySelector('.table-container');
  const chartContainer = document.querySelector('.chart-container');
  let isTableView = true;

  if (toggleSwitch) {
    toggleSwitch.addEventListener('click', function () {
      if (isTableView) {
        tableContainer.style.display = 'none';
        chartContainer.style.display = 'block';
        renderChart(); // Render the chart when switching to graph view
      } else {
        tableContainer.style.display = 'block';
        chartContainer.style.display = 'none';
      }
      isTableView = !isTableView;
    });
  }

  function renderChart() {
    const ctx = document.getElementById('transactions-chart').getContext('2d');

    // Process transaction data for the chart
    const merchantData = {};
    document.querySelectorAll('tr[data-account-id]').forEach(row => {
      const merchant = row.querySelector('td:nth-child(4)').textContent.trim();
      const amount = parseFloat(row.querySelector('td:nth-child(3)').textContent.replace('$', '').trim());
      if (merchantData[merchant]) {
        merchantData[merchant] += amount;
      } else {
        merchantData[merchant] = amount;
      }
    });

    const merchants = Object.keys(merchantData);
    const amounts = merchants.map(merchant => merchantData[merchant]);

    // Generate random colors for the chart
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

    // Create the pie chart
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: merchants,
        datasets: [{
          label: 'Money Spent by Merchant',
          data: amounts,
          backgroundColor: colors,
          hoverBackgroundColor: hoverColors,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.label}: $${context.raw.toFixed(2)}`;
              },
            },
          },
        },
      },
    });
  }
});

const overlay = document.getElementById('overlay');

// Toggle view: END */
