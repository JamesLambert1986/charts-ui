document.addEventListener("DOMContentLoaded", function () {

  const chart = document.getElementById('chart');
  const tbody = chart.querySelector('table tbody');

  const chartTypeSelect = document.getElementById('chart-type-select');


  const deleteRow = document.getElementById('deleteRow');
  const deleteColumn = document.getElementById('deleteColumn');

  const addRow = document.getElementById('addRow');
  const addColumn = document.getElementById('addColumn');

  const btn = document.getElementById('create');
  const generated = document.getElementById('generated');

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
    
      // If checked add class
      Array.from(document.querySelectorAll('#chart-options input[data-class]:checked')).forEach((checkbox, index) => {

        let checkboxID = checkbox.getAttribute('id');
        chart.classList.add(checkboxID);
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

  // Create the image
  btn.addEventListener('click', function() {
      
    chart.classList.add('capturing');

    html2canvas(chart).then(canvas => {
      generated.innerHTML = '';
      generated.appendChild(canvas);

      console.log(canvas);
      chart.classList.remove('capturing');
    });
  });


});