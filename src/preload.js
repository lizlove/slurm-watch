const base64 = require('base-64');
const dayjs = require('dayjs');
const Barchart = require('./barchart');
const Bubbleplot = require('./bubbleplot');
const Doughnut = require('./doughnut');
const LineChart = require('./linechart');
const Table = require('./table');

const user = process.env.PROMETHEUS_USER;
const pass = process.env.PROMETHEUS_PASS;
let dataMaster = [];
let dataMasterDict = {};
let lastMeasuredTime;

function getNow() {
  return dayjs().format('MMMM Do YYYY, h:mm:ss a');
}

function setLastMeasuredTime() {
  lastMeasuredTime = getNow();
  const element = document.getElementById('lastMeasuredTime');
  if (element) {
    element.innerText = `${lastMeasuredTime}`;
  }
}

function getColor(center) {
  const accountColors = {
    cca: 'rgb(191, 43, 36)',
    ccb: 'rgb(128, 172, 87)',
    ccm: 'rgb(242, 139, 0)',
    ccq: 'rgb(128, 93, 139)',
    ccn: 'rbg(0, 128, 158)',
    scc: 'rgb(246, 194, 68)',
    other: 'rgb(128, 127, 132)',
    info: 'rgb(65, 83, 175)',
    popeye: 'rgb(0, 131, 155)',
  };
  return accountColors[center];
}

const queries = [
  {
    label: 'Free CPUs (non-GPU) by location',
    name: 'cpuFree',
    query: 'sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes)',
  },
  {
    label: 'Allocated CPUs (non-GPU) by location',
    name: 'cpuAlloc',
    query: 'sum(slurm_node_cpus{state="alloc",nodes!="gpu"}) by (cluster,nodes)',
  },
  {
    label: 'Percent Free CPUs (non-GPU) by location',
    name: 'cpuPercentChart',
    query:
      'sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes) / sum(slurm_node_cpus{nodes!="gpu"}) by (cluster,nodes)',
  },
  {
    label: 'GPUs free by location',
    name: 'gpuFree',
    query: 'sum(slurm_node_gpus{state="free",nodes="gpu"}) by (cluster)',
  },
  {
    label: 'GPUs allocated by location',
    name: 'gpuAlloc',
    query: 'sum(slurm_node_gpus{state="alloc",nodes="gpu"}) by (cluster)',
  },
  {
    label: 'Slurm queued pending job requests',
    name: 'queued',
    query: 'sum(slurm_job_count{state="pending"}) by (account)',
  },
];

const rangeQueries = [
  {
    label: 'Rusty queue wait time over 24 hours',
    name: 'waitTime',
    query: 'sum(slurm_job_seconds{cluster="iron",state="pending"}) by (account)',
    amount: 1,
    unit: 'day',
    step: '15m',
  },
  {
    label: 'Rusty queue length over 24 hours',
    name: 'lengthQueue',
    query: 'sum(slurm_job_count{state="pending"}) by (account)',
    amount: 1,
    unit: 'day',
    step: '15m',
  },
  {
    label: 'Node counts by center for the last 7 Days',
    name: 'nodeCount',
    query: 'sum(slurm_job_nodes{state="running"}) by (account)',
    amount: 7,
    unit: 'day',
    step: '90m',
  },
];

const barCharts = [
  // TODO: FIX THESE COLORS DAWG 🐶
  {
    label: 'Iron Broadwell',
    cluster: 'iron',
    nodes: 'broadwell',
    color: '255,99,132',
  },
  {
    label: 'Iron Skylake',
    cluster: 'iron',
    nodes: 'skylake',
    color: '54,162,235',
  },
  {
    label: 'Iron Infiniband',
    cluster: 'iron',
    nodes: 'ib',
    color: '255,206,86',
  },
  {
    label: 'Iron BNL',
    cluster: 'iron',
    nodes: 'bnl',
    color: '75,192,192',
  },
  {
    label: 'Popeye Skylake',
    cluster: 'popeye',
    nodes: 'skylake',
    color: '153,102,255',
  },
  {
    label: 'Popeye Cascade Lake',
    cluster: 'popeye',
    nodes: 'cascadelake',
    color: '255,159,64',
  },
];

// Fetch data from Prometheus.
async function fetchData(queryObj, isRange) {
  const base = isRange
    ? 'http://prometheus.flatironinstitute.org/api/v1/query_range?query='
    : 'http://prometheus.flatironinstitute.org/api/v1/query?query=';

  let url = base + encodeURI(queryObj.query);

  if (isRange) {
    const end = dayjs().subtract(10, 'minutes').toISOString();
    const start = dayjs().subtract(queryObj.amount, queryObj.unit).toISOString();

    url += encodeURI(`&start=${start}&end=${end}&step=${queryObj.step}`);
  }

  return (
    fetch(url, {
      headers: new Headers({
        Authorization: `Basic ${base64.encode(`${user}:${pass}`)}`,
      }),
    })
      .then((res) => res.json())
      .then((body) => {
        if (body.status === 'success') {
          return body.data.result;
        }
        return {};
      })
      /* eslint-disable-next-line no-unresolved */
      .catch((err) => console.log(Error(err.statusText)))
  );
}

async function getDatasets() {
  const fetchArr = queries.map(async (queryObj) => ({
    data: await fetchData(queryObj, false),
    name: queryObj.name,
  }));

  const fetchRangeArr = rangeQueries.map(async (rangeQueryObj) => ({
    data: await fetchData(rangeQueryObj, true),
    name: rangeQueryObj.name,
  }));

  return Promise.all(fetchArr.concat(fetchRangeArr));
}

function filterDataMaster(char) {
  return dataMaster.filter((data) => data.name.charAt(0) === char);
}

function filterDataMasterWithoutPopeye(char) {
  return filterDataMaster(char)[0].data.filter((center) => center.metric.account !== 'popeye');
}

// function mapDict(data, f) {
//   const r = {};
//   for (const k in data) {
//     r[k] = f(data[k]);
//   }
//   return r;
// }

function dictBy(data, key, value) {
  const r = {};
  for (const d of data) {
    r[key(d)] = value(d);
  }
  return r;
}

function valueByCluster(data) {
  return dictBy(
    data,
    (d) => d.metric.cluster,
    (d) => d.value[1]
  );
}

// function sortCPUData(cpudata) {
//   cpudata.sort((last, next) => {
//     if (last.metric.cluster === next.metric.cluster) {
//       // Nodes are only important when clusters are the same.
//       return last.metric.nodes > next.metric.nodes ? 1 : -1;
//     }
//     return last.metric.cluster > next.metric.cluster ? 1 : -1;
//   });
//   // Remove mem from display.
//   return cpudata.filter((obj) => obj.metric.nodes !== 'mem');
// }

function findBarChart(chartObj, chart) {
  /* eslint-disable-next-line no-shadow */
  const oo = chartObj.find((oo) => oo.metric.cluster === chart.cluster && oo.metric.nodes === chart.nodes);
  if (oo) {
    return oo.value[1];
  }
  return null;
}

// Parse data for Chart
function getBarChartData(chartObj) {
  return barCharts.map((c) => findBarChart(chartObj, c));
}

function getDoughnutData() {
  const free = valueByCluster(dataMasterDict.gpuFree);
  const alloc = valueByCluster(dataMasterDict.gpuAlloc);
  const dough = {
    iron: {
      backgroundColor: ['rgba(153, 102, 255, 1)', 'rgba(153, 102, 255, 0.2)'],
      borderColor: ['rgba(153, 102, 255, 1)', 'rgba(153, 102, 255, 1)'],
      data: [free.iron, alloc.iron],
      label: 'Iron',
    },
    popeye: {
      backgroundColor: ['rgba(255, 99, 132, 1)', 'rgba(255, 99, 132, 0.2)'],
      borderColor: ['rgba(255, 99, 132, 1)', 'rgba(255, 99, 132, 1)'],
      data: [free.popeye, alloc.popeye],
      label: 'Popeye',
    },
  };
  return dough;
}

function combineBubbleData(waittimes, queuelengths) {
  const combined = [];
  if (waittimes.length !== queuelengths.length) {
    console.error('length mismatch', waittimes, queuelengths);
  }
  const shorter = waittimes.length < queuelengths.length ? waittimes.length : queuelengths.length;
  for (let i = 0; i < shorter; i++) {
    const tstamp1 = waittimes[i][0];
    const y = waittimes[i][1];
    const tstamp2 = queuelengths[i][0];
    const r = queuelengths[i][1];
    // strip the decimal with Math.floor
    if (Math.floor(tstamp1) !== Math.floor(tstamp2)) {
      // todo: invent a better error mechanism
      console.error('mismatch', '⏰', waittimes[i], '📐', queuelengths[i]);
    } else {
      combined.push({
        x: dayjs(tstamp1).unix(), // timestamp
        y: Math.floor(parseInt(y, 10) / 60000), // waittime string
        r, // queue length
      });
    }
  }
  return combined;
}

function getBubbleplotData() {
  const waitTimes = filterDataMasterWithoutPopeye('w');
  const queueLengths = filterDataMasterWithoutPopeye('l');
  const combo = [];
  for (let i = 0; i < waitTimes.length; i++) {
    if (waitTimes[i].metric.account === queueLengths[i].metric.account) {
      const datamap = combineBubbleData(waitTimes[i].values, queueLengths[i].values);
      const border = getColor(waitTimes[i].metric.account);
      const background = border.replace(/rgb/i, 'rgba').replace(/\)/i, ',0.2)');
      combo.push({
        label: waitTimes[i].metric.account,
        backgroundColor: background,
        borderColor: border,
        borderWidth: 1,
        hoverRadius: 1,
        hitRadius: 1,
        data: datamap,
      });
    } else {
      console.error(
        'Bubble data objects out of order',
        typeof waitTimes[i].metric.account,
        typeof queueLengths[i].metric.account
      );
    }
  }
  return combo;
}

function buildBarChart() {
  const cpuDatasets = [
    {
      backgroundColor: barCharts.map((c) => `rgba(${c.color},1)`),
      borderColor: barCharts.map((c) => `rgba(${c.color},0.2)`),
      borderWidth: 1,
      data: getBarChartData(dataMasterDict.cpuFree),
      label: 'Free CPUs (non-GPU) by location',
    },
    {
      backgroundColor: barCharts.map((c) => `rgba(${c.color},0.2)`),
      borderColor: barCharts.map((c) => `rgba(${c.color},1)`),
      borderWidth: 1,
      data: getBarChartData(dataMasterDict.cpuAlloc),
      label: 'Allocated CPUs (non-GPU)',
    },
  ];
  Barchart.drawStackedBarChart(
    'cpuChart',
    cpuDatasets,
    barCharts.map((c) => c.label)
  );
}

function buildDoughnutCharts() {
  let gpuData = {};
  gpuData = getDoughnutData();
  let index = 1;
  for (const value in gpuData) {
    if (Object.prototype.hasOwnProperty.call(gpuData, value)) {
      Doughnut.drawDoughnutChart(
        [gpuData[value]],
        `gpuChart${index}`,
        ['Free', 'In Use'],
        `${value.toString().toUpperCase()}`
      );
    }
    index++;
  }
}

function buildTable() {
  const currentQueuedData = dataMasterDict.queued;
  currentQueuedData.sort((a, b) => (a.metric.account > b.metric.account ? 1 : -1));
  Table.drawTable('queueTable', currentQueuedData, ['Center', 'Count'], 'Current Queue Count');
}

function buildLineChart() {
  const { nodeCount } = dataMasterDict;
  nodeCount.sort((a, b) => (a.metric.account > b.metric.account ? 1 : -1));
  const nodecontent = [];
  for (const a of nodeCount) {
    let background = getColor(a.metric.account);
    if (!background) {
      background = getColor('other');
    }
    const border = background.replace(/rgb/i, 'rgba').replace(/\)/i, ',0.2)');
    const dataMap = [];
    a.values.forEach((val) => {
      const [time, qty] = val;
      dataMap.push({ y: parseInt(qty, 10), x: dayjs(time).unix() });
    });
    nodecontent.push({
      label: a.metric.account,
      data: dataMap,
      fill: false,
      backgroundColor: background,
      borderColor: border,
    });
  }

  LineChart.drawLineChart('nodeChart', nodecontent, 'Node counts by center for the last 7 Days');
}

function buildBubbleplot() {
  const bubbleContent = getBubbleplotData();

  Bubbleplot.drawBubbleplot('bubbleplot', bubbleContent, [
    'Wait time by center over last 24 hours',
    'Point size reflects number of queue items',
  ]);
}

function toggleLoading() {
  const loading = document.getElementById('loading');
  if (!loading.style.display) {
    loading.style.display = 'block';
  } else {
    loading.style.display = 'none';
  }
}

function drawCharts() {
  toggleLoading(); // loading off

  buildBarChart(); // Draw cpu chart
  buildDoughnutCharts(); // Draw gpu charts
  buildTable(); // Draw queued data table
  buildLineChart(); // Draw node count chart
  buildBubbleplot(); // Draw queue bubbleplot

  // Set timer
  setLastMeasuredTime();
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function doTheThing() {
  toggleLoading(); // loading on

  dataMaster = await getDatasets();
  dataMasterDict = dictBy(
    dataMaster,
    (d) => d.name,
    (d) => d.data
  );

  console.table(dataMaster);
  drawCharts();
  await sleep(120000);
  doTheThing();
}

// Set loading screen for initial display
window.addEventListener('DOMContentLoaded', () => {
  doTheThing();
});
