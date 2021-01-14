const { Chart } = require('chart.js');

function drawBubbleplot(element, datasets, title) {
  const ctx = document.getElementById(element);

  const bubbleplot = new Chart(ctx, {
    type: 'bubble',
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
              unit: 'hour',
            },
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Time',
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
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: 'Wait in minutes',
            },
          },
        ],
      },
    },
  });
  return bubbleplot;
}

module.exports = { drawBubbleplot };
