document.addEventListener('DOMContentLoaded', () => {
	const stocksButton = document.querySelector('a[href="/stock"]');
    const stockContent = document.querySelector('.stock-content');
    const menu = document.querySelector('.menu');
  
    // Sample data for the stock graph
    const stockData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Stock Prices',
        data: [150, 160, 170, 165, 180, 175],
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
      }]
    };
  
    let stockChart;
  
    const stockCtx = document.getElementById('stock-chart').getContext('2d');
    stockChart = new Chart(stockCtx, {
      type: 'line',
      data: stockData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
    });
});

// vim: set ts=2 sw=2 sts=2 noet filetype=javascript:
