document.addEventListener("DOMContentLoaded", function () {

  const chart = document.getElementById('chart');
  const tbody = chart.querySelector('table tbody');

  const chartTypeSelect = document.getElementById('chart-type-select');


  const deleteRow = document.getElementById('deleteRow');
  const deleteColumn = document.getElementById('deleteColumn');

  const addRow = document.getElementById('addRow');
  const addColumn = document.getElementById('addColumn');


  
  const setValues = document.getElementById('setValues');
  const setGuidelines = document.getElementById('setGuidelines');
  const setTargets = document.getElementById('setTargets');
  const setEvents = document.getElementById('setEvents');

  const btn = document.getElementById('create');
  const generated = document.getElementById('generated');
  const genWrapper = document.getElementById('genWrapper');

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

  // Create the image
  btn.addEventListener('click', function() {
      
    chart.classList.add('capturing');

    html2canvas(chart).then(canvas => {
      generated.innerHTML = '';
      generated.appendChild(canvas);
      chart.classList.remove('capturing');
      genWrapper.scrollIntoView();
    });
  });
});
