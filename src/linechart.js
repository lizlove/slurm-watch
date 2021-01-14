const { Chart } = require('chart.js');

function drawLineChart(element, datasets, title) {
  const ctx = document.getElementById(element);
  const lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets,
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: title,
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            time: {
              unit: 'day',
            },
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Date',
            },
            ticks: {
              major: {
                enabled: true,
              },
            },
          },
        ],
        yAxes: [
          {
            display: true,
            stacked: false,
            scaleLabel: {
              display: true,
              labelString: 'value',
            },
          },
        ],
      },
    },
  });
  return lineChart;
}

module.exports = { drawLineChart };
