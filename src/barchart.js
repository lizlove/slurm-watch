const { Chart } = require('chart.js');

function drawStackedBarChart(element, datasets, labels) {
  const ctx = document.getElementById(element);
  const stackedBarChart = new Chart(ctx, {
    data: {
      datasets,
      labels,
    },
    options: {
      scales: {
        xAxes: [{ stacked: true }],
        yAxes: [
          {
            stacked: true,
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
    type: 'bar',
  });
  return stackedBarChart;
}

module.exports = { drawStackedBarChart };
