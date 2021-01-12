const base64 = require('base-64');
const dayjs = require('dayjs');
const Barchart = require('./barchart');
const Bubbleplot = require('./bubbleplot');
var Doughnut = require('./doughnut');
var LineChart = require('./linechart');
var Table = require('./table');

var user = process.env.PROMETHEUS_USER;
var pass = process.env.PROMETHEUS_PASS;
var dataMaster = [];
var dataMasterDict = {};
var lastMeasuredTime;
var chartHeight;

function setLastMeasuredTime() {
  lastMeasuredTime = getNow();
  var element = document.getElementById('lastMeasuredTime');
  if (element) {
    element.innerText = '' + lastMeasuredTime;
  }
}

function getNow() {
  return dayjs().format('MMMM Do YYYY, h:mm:ss a');
}

function getColor(center) {
  var accountColors = {
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

var queries = [
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

var rangeQueries = [
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

var backgroundIndex = 0;
var backgroundColors = [
  '#858585',
  '#3d4dff',
  '#ffffff',
  '#f5f5dc',
  '#3f8fd4',
  '#8c8599',
  '#00d5fa',
  '#ffb32f',
  '#4138a1',
  '#ffffff',
  '#6e719e',
  '#ababab',
  '#ed8917',
  '#787878',
  '#0ccc1c',
  '#87ff5c',
  '#ffffff',
  '#440be0',
  '#575757',
  '#e0d8c7',
  '#78FA8C',
  '#FFEE52',
  '#7d7d7d',
  '#ff0000',
  '#006400',
  '#ff7d7d',
  '#00ff09',
  '#c9c3c3',
  '#d9e9f7',
  '#f0c539',
  '#0000fb',
  '#fa002e',
  '#006cfa',
  '#ff7bff',
  '#ff4b0a',
  '#ffcc99',
  '#fe984d',
  '#4c914e',
  '#bec7a2',
  '#ffc108',
  '#cc9966',
  '#0031ff',
  '#ebcece',
  '#4ea8fc',
  '#990f46',
  '#d8cda3',
  '#cddede',
  '#67caeb',
  '#e85858',
  '#d3d4e0',
  '#e00025',
  '#f405fc',
  '#f5b505',
  '#acacac',
  '#6791d3',
  '#455de6',
  '#6ae8c0',
  '#d1d143',
  '#ffc5b2',
  '#5f96a1',
  '#4955fc',
  '#e3ff8f',
  '#482e84',
  '#6b7367',
  '#ffff00',
  '#9bbac2',
  '#E7C0ED',
  '#bdd5e6',
  '#bfbfbf',
  '#feffb2',
  '#c9e1f5',
  '#71C5E8',
  '#52a1eb',
  '#fcfcfc',
  '#707682',
  '#f08660',
  '#ceff0a',
  '#43d61a',
  'rgba(255, 239, 97, 1.00)',
  '#FF33FF',
  '#fa697a',
  '#ff99c9',
  '#e2ecf0',
  '#A1C1F4',
  'rgba(252, 0, 244, 1.00)',
  '#9e9e9e',
  '#9fb899',
  '#f2b530',
  '#d102c7',
  '#f26508',
  '#e9f0a1',
  '#3b5998',
  '#e615c3',
  '#11ff00',
  '#e0ed23',
  '#fff242',
  '#9965e6',
  '#ffce64',
  'rgba(237, 187, 7, 1.00)',
  '#ff0000',
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

    url = url + encodeURI(`&start=${start}&end=${end}&step=${queryObj.step}`);
  }

  return await fetch(url, {
    headers: new Headers({
      Authorization: `Basic ${base64.encode(`${user}:${pass}`)}`,
    }),
  })
    .then((res) => res.json())
    .then((body) => {
      if (body.status === 'success') {
        return body.data.result;
      } else {
        return {};
      }
    })
    // tslint:disable-next-line
    .catch((err) => console.log(Error(err.statusText)));
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

function mapDict(data, f) {
  const r = {};
  for (const k in data) {
    r[k] = f(data[k]);
  }
  return r;
}

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

function sortCPUData(cpudata) {
  cpudata.sort((last, next) => {
    if (last.metric.cluster === next.metric.cluster) {
      // Nodes are only important when clusters are the same.
      return last.metric.nodes > next.metric.nodes ? 1 : -1;
    }
    return last.metric.cluster > next.metric.cluster ? 1 : -1;
  });
  // Remove mem from display.
  return cpudata.filter((obj) => obj.metric.nodes !== 'mem');
}
