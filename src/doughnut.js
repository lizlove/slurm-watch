const { Chart } = require('chart.js');

function drawDoughnutChart(datasets, element, labels, title) {
  const ctx = document.getElementById(element);
  const doughnutChart = new Chart(ctx, {
    data: {
      datasets,
      labels,
    },
    options: {
      responsive: true,
      animation: {
        animateRotate: true,
        animateScale: true,
      },
      circumference: Math.PI,
      legend: {
        position: 'top',
      },
      rotation: Math.PI,
      title: {
        display: true,
        text: title,
      },
    },
    type: 'doughnut',
  });
  return doughnutChart;
}

module.exports = { drawDoughnutChart };
