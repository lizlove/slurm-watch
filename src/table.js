function drawTable(element, dataset, labels, title) {
  const ctx = document.getElementById(element);
  ctx.innerHTML = '';
  const table = document.createElement('table');
  const caption = document.createElement('caption');
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  const tbody = document.createElement('tbody');

  let accounts = ['cca', 'ccb', 'ccm', 'ccq', 'popeye'];

  ctx.appendChild(table);
  caption.innerHtml = title;
  table.appendChild(caption);
  table.appendChild(thead);
  thead.appendChild(trHead);
  table.appendChild(tbody);

  labels.forEach((label) => {
    const th = document.createElement('th');
    th.innerHTML = label;
    trHead.appendChild(th);
  });

  function buildRow(row) {
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    if (row.metric.account !== 'popeye') {
      td1.innerHTML = row.metric.account;
    } else {
      td1.innerHTML = 'other';
    }
    td2.innerHTML = row.value ? row.value[1] : '';

    tbody.appendChild(tr);
    tr.appendChild(td1);
    tr.appendChild(td2);
  }

  for (const row of dataset) {
    buildRow(row);
    // remove accounts from list
    accounts = accounts.filter((account) => account !== row.metric.account);
  }

  if (accounts.length) {
    for (const row of accounts) {
      const stub = {
        metric: { account: row },
        value: [0, '0'],
      };
      buildRow(stub);
    }
  }
}

module.exports = { drawTable };
