import { csvToObj, createTable, createSeries, deleteCellData } from  '../../_assets/js/modules/chart.js';

document.addEventListener("DOMContentLoaded", function () {

  const chartWrapper = document.getElementById('chartWrapper');
  let chart = document.getElementById('chart');
  let tbody = chart.querySelector('table tbody');
  let table = chart.querySelector('table');

  const chartTypeSelect = document.getElementById('chart-type-select');

  const deleteRow = document.getElementById('deleteRow');
  const deleteColumn = document.getElementById('deleteColumn');

  const addRow = document.getElementById('addRow');
  const addColumn = document.getElementById('addColumn');

  const setValues = document.getElementById('setValues');
  const setGuidelines = document.getElementById('setGuidelines');
  const setTargets = document.getElementById('setTargets');
  const setEvents = document.getElementById('setEvents');
  const setSeries = document.getElementById('setSeries');

  const btn = document.getElementById('create');
  const generated = document.getElementById('generated');
  const genWrapper = document.getElementById('genWrapper');
  const csvInput = document.getElementById('csvFile');

  const htmlBtn = document.getElementById('createHTML');
  const htmlPreview = document.getElementById('htmlPreview');
  const htmlWrapper = document.getElementById('htmlWrapper');
  const copyHTML = document.getElementById('copyHTML');

  const standaloneBtn = document.getElementById('createStandalone');
  const standalonePreview = document.getElementById('standalonePreview');
  const standaloneWrapper = document.getElementById('standaloneWrapper');


  const exportCSV = document.getElementById('exportCSV');


  // Set the colours on the chart element, use the root vars as default
  Array.from(document.querySelectorAll('#chart-options input:not([data-class])')).forEach((input, index) => {

    const inputID = input.getAttribute('id');
    let value = getComputedStyle(document.documentElement).getPropertyValue(`--${inputID}`).trim();

    // convert value to a number so its a valid value
    if(input.getAttribute('type') == 'number')
      value = parseFloat(value);

    // Set the value of the input field
    input.value = value;

    // Set the var onto the chart element this will override the root var
    input.addEventListener('change', function(event) {
      chart.style.setProperty(`--${inputID}`, input.value);
    });
  });

  // Update chart type
  chartTypeSelect.addEventListener('change', function() {
    
    const input = document.getElementById(this.value);
    const e = new Event("change");

    input.checked = true;
    input.dispatchEvent(e);
  });



  // Update the chart classes to change the view of the chart
  Array.from(document.querySelectorAll('#chart-options input[data-class]')).forEach((input, index) => {

    const inputID = input.getAttribute('id');

    input.addEventListener('change', function(event) {

      // Reset to default class
      chart.className = 'chart';

      document.getElementById('chart-height').removeAttribute('disabled');
      document.getElementById('chart-height-lg').removeAttribute('disabled');
    
      // If checked add class
      Array.from(document.querySelectorAll('#chart-options input[data-class]:checked')).forEach((checkbox, index) => {

        let checkboxID = checkbox.getAttribute('id');
        chart.classList.add(checkboxID);

        if(checkboxID == 'chart--short' || checkboxID == 'chart--tall'){
          document.getElementById('chart-height').setAttribute('disabled','disabled');
          document.getElementById('chart-height-lg').setAttribute('disabled','disabled');
        }
      });
    });
  });

  // Add column or row
  addRow.addEventListener('click', function() {
    
    const lastRow = tbody.querySelector(':scope > tr:last-child');
    const cloneRow = lastRow.cloneNode(true);
    tbody.append(cloneRow);
  });

  addColumn.addEventListener('click', function() {
    
    
    Array.from(chart.querySelectorAll('tr')).forEach((row, index) => {

      const lastCell = row.querySelector(':scope > td:last-child, :scope > th:last-child');
      const cloneCell = lastCell.cloneNode(true);
      row.append(cloneCell);
    });
  });


  // Remove column or row
  deleteRow.addEventListener('click', function() {
    
    let rowNumber = prompt('Which row');

    if(Number.isInteger(parseInt(rowNumber))){

      const chosenRow = tbody.querySelector(`:scope > tr:nth-child(${rowNumber})`);

      if(chosenRow)
        chosenRow.remove();
    }
  });

  deleteColumn.addEventListener('click', function() {
    
    let colNumber = prompt('Which column');

    if(Number.isInteger(parseInt(colNumber))){

      Array.from(chart.querySelectorAll('tr')).forEach((row, index) => {

        const chosenCell = row.querySelector(`:scope > td:nth-child(${parseInt(colNumber)+1}), :scope > th:nth-child(${parseInt(colNumber)+1})`);

        if(chosenCell)
          chosenCell.remove();
      });
    }
  });


  // Add and delete config rows 
  Array.from(document.querySelectorAll('[data-add-config]')).forEach(function(element) {

    element.addEventListener('click', function() {
      
      const configID = element.getAttribute('data-add-config');

      const target = document.querySelector(`#${configID} > *:last-child`);
      const clone = target.cloneNode(true);
      target.parentNode.insertBefore(clone, target.nextSibling);
    });
  });

  Array.from(document.querySelectorAll('[data-delete-config]')).forEach(function(element) {
    element.addEventListener('click', function() {
      
      const configID = element.getAttribute('data-delete-config');
      const target = document.querySelector(`#${configID} > *:last-child:not(:first-child)`);
      
      if(target)
        target.remove();
    });
  });


  setValues.addEventListener('click', function() {
    
    let min = document.querySelector('[name="chart-min"]').value.replace('£','').replace('%','');
    let max = document.querySelector('[name="chart-max"]').value.replace('£','').replace('%','');

    chart.setAttribute('data-min', min);
    chart.setAttribute('data-max', max);
  });


  setGuidelines.addEventListener('click', function() {
    
    let targetsStr = "";

    Array.from(document.querySelectorAll('#chart-guidelines > *')).forEach((target, index) => {

      let value = target.querySelector('[name="chart-guideline"]').value;

      if(index != 0)
        targetsStr += `, `;

      targetsStr += `${value}`;
    });

    if(targetsStr != ""){

      chart.setAttribute('data-guidelines', `${targetsStr}`);
    }
  });

  setTargets.addEventListener('click', function() {
    
    let targetsStr = "";

    Array.from(document.querySelectorAll('#chart-targets > *')).forEach((target, index) => {

      let value = target.querySelector('[name="chart-target"]').value;
      let label = target.querySelector('[name="chart-target-text"]').value;

      if(index != 0)
        targetsStr += `, `;

      targetsStr += `"${label}":"${value}"`
    });

    if(targetsStr != ""){

      chart.setAttribute('data-targets', `{${targetsStr}}`);
    }
  });

  setEvents.addEventListener('click', function() {
    
    let targetsStr = "";

    Array.from(document.querySelectorAll('#chart-events > *')).forEach((event, index) => {

      let value = event.querySelector('[name="chart-event"]').value;
      let label = event.querySelector('[name="chart-event-text"]').value;

      if(index != 0)
        targetsStr += `, `;

      targetsStr += `"${value}":"${label}"`
    });

    if(targetsStr != ""){

      chart.setAttribute('data-events', `{${targetsStr}}`);
    }
  });


  setSeries.addEventListener('click', function() {
    
    chart.setAttribute('data-series', 'true');
    createSeries(chart);
  });

  // Create the image
  btn.addEventListener('click', function() {
      
    chart.classList.add('capturing');

    html2canvas(chart).then(canvas => {
      generated.innerHTML = '';
      generated.appendChild(canvas);
      chart.classList.remove('capturing');
      genWrapper.scrollIntoView();


      const link = document.createElement('a');
      link.download = 'download.png';
      link.href = canvas.toDataURL();
      link.innerHTML = 'Download image';

      link.classList.add('btn');
      link.classList.add('btn-primary');
      link.classList.add('mt-3');

      genWrapper.append(link);

    });
  });

  const escapeHTML = str => str.replace(
    /[&<>'"]/g,
    tag =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
  );

  // Create the html preview
  htmlBtn.addEventListener('click', function() {
      
    console.log(typeof table.outerHTML);

    const clone = chart.cloneNode();
    const cloneTable = table.cloneNode(true);

    clone.append(cloneTable);
    
    deleteCellData(clone);

    
    let html = html_beautify(clone.outerHTML, { indent_size: 2, space_in_empty_paren: true })


    htmlPreview.innerHTML = `<pre><code class="language-html bg-light border" id="htmlCode">${escapeHTML(html)}</code></pre>`;

    hljs.highlightAll();

    htmlWrapper.scrollIntoView();
  });

  let clipboardHTML = new ClipboardJS('#copyHTML');
  
  clipboardHTML.on('success', function(e) {

    e.trigger.textContent = 'Copied HTML'
    e.clearSelection()
    setTimeout(function() {
        e.trigger.textContent = 'Copy HTML'
    }, 5000)
  });



  
  standaloneBtn.addEventListener('click', function() {

    let html = html_beautify(chart.outerHTML, { indent_size: 2, space_in_empty_paren: true })


    function css_text(x) { return x.cssText; }
    var file = document.getElementById('css');
    var cssFile = Array.prototype.map.call(file.sheet.cssRules, css_text).join('\n');

console.log(cssFile);

    standalonePreview.innerHTML = `<pre><code class="language-html bg-light border" id="standaloneCode">${escapeHTML(html)}\n${escapeHTML('<style>')}\n${cssFile}\n${escapeHTML('</style>')}\n</code></pre>`;

    hljs.highlightAll();

    standaloneWrapper.scrollIntoView();
  });

  let clipboardStandalone = new ClipboardJS('#copyStandaloneHTML');
  
  clipboardStandalone.on('success', function(e) {

    e.trigger.textContent = 'Copied standalone HTML'
    e.clearSelection()
    setTimeout(function() {
        e.trigger.textContent = 'Copy standalone HTML'
    }, 5000)
  });



  // Upload CSV file
  csvInput.addEventListener('input', function(e) {
    e.preventDefault();
    const input = csvFile.files[0];

    const reader = new FileReader();
    reader.addEventListener('load', (e) => {
      const text = e.target.result;
      const data = csvToObj(text);

      chart.remove();
      chartWrapper.innerHTML = `<figure class="chart" data-min="0" data-max="3000" id="chart"></figure>`;
      chart = document.getElementById('chart');
      createTable(chart, data);
      tbody = chart.querySelector('table tbody');

      console.log(data);
    });
    reader.readAsText(input);
    
  });



  function download_table_as_csv(table_id, separator = ',') {
    // Select rows from table_id
    var rows = document.querySelectorAll('#' + table_id + ' table tr');
    // Construct csv
    var csv = [];
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll('td, th');
        for (var j = 0; j < cols.length; j++) {
            // Clean innertext to remove multiple spaces and jumpline (break csv)
            var data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
            // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
            data = data.replace(/"/g, '""');
            // Push escaped string
            row.push('"' + data + '"');
        }
        csv.push(row.join(separator));
    }
    var csv_string = csv.join('\n');
    // Download it
    var filename = 'export_' + table_id + '_' + new Date().toLocaleDateString() + '.csv';
    var link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportCSV.addEventListener('click', function(e) {

    download_table_as_csv('chart');
  });
});
