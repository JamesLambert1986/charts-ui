import { ucfirst, unsnake } from './helpers.js'

function chart(chartElement,min,max,type,guidelines,targets,events) {

  const chartID = `chart-${Date.now()}`;

  if(chartElement.hasAttribute('data-csv') && !chartElement.hasAttribute('data-csv-loaded')){
    let csvURL = chartElement.getAttribute('data-csv');

    let csvData = getCSVData(chartElement, csvURL);

    console.log('create the table')
    return false;
  }


  let table = chartElement.querySelector('table');


  if(typeof min == 'undefined'){
    min = chartElement.getAttribute('data-min');
  }
  if(typeof max == 'undefined'){
    max = chartElement.getAttribute('data-max');
  }
  if(typeof type == 'undefined'){
    type = chartElement.getAttribute('data-type') ? chartElement.getAttribute('data-type') : 'column';
  }
  if(typeof guidelines == 'undefined'){

    if(chartElement.hasAttribute('data-guidelines')){
      guidelines = chartElement.getAttribute('data-guidelines').split(',');
    }
    else if(chartElement.querySelector('.chart__yaxis')){
      chartElement.setAttribute('data-guidelines', Array.from(chartElement.querySelectorAll('.chart__yaxis .axis__point')).map((element) => element.innerText));
    }
  }

  if(typeof targets == 'undefined' && chartElement.hasAttribute('data-targets')){
    targets = JSON.parse(chartElement.getAttribute('data-targets'));
  }
  if(typeof events == 'undefined' && chartElement.hasAttribute('data-events')){
    events = JSON.parse(chartElement.getAttribute('data-events'));
  }



  // Wrap the table with some divs to add functionality
  if(!chartElement.querySelector('.table__wrapper')){

    const tableWrapper = document.createElement('div');
    tableWrapper.setAttribute('class','table__wrapper');

    chartElement.append(tableWrapper);
    tableWrapper.append(table);
  }

  if(!chartElement.querySelector('.chart__inner')){

    const tableWrapper = chartElement.querySelector('.table__wrapper');
    const chartInner = document.createElement('div');
    chartInner.setAttribute('class','chart__inner');

    chartInner.append(tableWrapper);
    chartElement.append(chartInner);
  }


  // set the longest label attr so that the bar chart knows what margin to set on the left
  let longestLabel = '';
  const chartInner = chartElement.querySelector('.chart__inner');
  Array.from(table.querySelectorAll('tbody tr td:first-child')).forEach((td, index) => {

    if(td.innerText.length > longestLabel.length){
      longestLabel = td.innerText;
    }
  });
  chartInner.setAttribute('data-longest-label',longestLabel);

  // set the longest data set attr so that the bar chart knows what margin to set on the left
  let longestSet = '';
  Array.from(table.querySelectorAll('thead tr th')).forEach((td, index) => {

    if(td.innerText.length > longestSet.length){
      longestSet = td.innerText;
    }
  });
  chartInner.setAttribute('data-set-label',longestSet);

  // Create chart key if the one isn't already created
  if(!chartElement.querySelector('.chart__key')){
    createChartKey(chartID,chartElement);
  }


  // Create the required type input field if one isn't set
  if(!chartElement.querySelector(':scope > [type="radio"]:checked')){
    createChartType(chartID,chartElement,type);
  }


  // Y Axis and Guidelines
  if(guidelines){
    createChartYaxis(chartElement,min,max,guidelines);
    createChartGuidelines(chartElement,min,max,guidelines);
  }

  if(targets){
    createTargets(chartElement,min,max,targets);
  }
  if(events){
    createEvents(chartElement,events);
  }

  // Make sure table cells have enough data attached to them to display the chart data
  setCellData(chartElement,min,max);


  // Create lines for line graph
  if(chartElement.querySelector(':scope > input[value="line"]:checked'))
    createLines(chartElement,min,max);

  // Create pies
  if(chartElement.querySelector(':scope > input[value="pie"]:checked'))
    createPies(chartElement);

  // Event handlers
  const showData = chartElement.querySelectorAll(':scope > input[type="checkbox"]');

  for (var i = 0; i < showData.length; i++) {
    showData[i].addEventListener('change', function() {
      
      if(chartElement.querySelector(':scope > input[value="pie"]:checked'))
        createPies(chartElement);
    });
  }

  if(chartElement.querySelector(':scope > input[type="radio"]')){

    const chartTypes = chartElement.querySelectorAll(':scope > input[type="radio"]');

    for (var i = 0; i < chartTypes.length; i++) {
      chartTypes[i].addEventListener('change', function() {
          
        switch(this.value){
          case "line":
            createLines(chartElement,min,max)
            break;
          case "pie":
            createPies(chartElement)
            break;
        }
      });
    }

  }

  // event observers 
  const attributesUpdated = (mutationList, observer) => {
    for (const mutation of mutationList) {

      observer.disconnect();
      observer2.disconnect();

      if (mutation.type === 'childList') {
        console.log('A child node has been added or removed.');
      } else if (mutation.type === 'attributes') {
        console.log(`The ${mutation.attributeName} attribute was modified.`);
      }

      
      min = chartElement.getAttribute('data-min');
      max = chartElement.getAttribute('data-max');
      

      Array.from(chartElement.querySelectorAll('tbody tr td[data-numeric]')).forEach((td, index) => {
        
        if(parseFloat(td.getAttribute('data-numeric')) > max){

          max = parseFloat(td.getAttribute('data-numeric'));
        }
      });


      if(mutation.type === 'attributes'){

        let guidelines = chartElement.getAttribute('data-guidelines') ? chartElement.getAttribute('data-guidelines').split(',') : [];
        
        // Y Axis and Guidelines
        if(guidelines){
          createChartYaxis(chartElement,min,max,guidelines);
          createChartGuidelines(chartElement,min,max,guidelines);

          if(chartElement.hasAttribute('data-targets')){
            targets = JSON.parse(chartElement.getAttribute('data-targets'));
            createTargets(chartElement,min,max,targets);
          }
        }

        if(chartElement.hasAttribute('data-events')){
          events = JSON.parse(chartElement.getAttribute('data-events'));
          createEvents(chartElement,events);
        }

        deleteCellData(chartElement);
      }

      setCellData(chartElement,min,max);

      // Create lines for line graph
      if(chartElement.querySelector(':scope > input[value="line"]:checked'))
        createLines(chartElement,min,max);

      // Create pies
      if(chartElement.querySelector(':scope > input[value="pie"]:checked'))
        createPies(chartElement);

        

      observer.observe(table, { attributes: true, childList: true, subtree: true });
      observer2.observe(chartElement, { attributes: true });

    }
  };

  const tableUpdated = (mutationList, observer) => {

    for (const mutation of mutationList) {

      observer.disconnect();
      observer2.disconnect();

      let attributeChange = false;

      min = chartElement.getAttribute('data-min');
      max = chartElement.getAttribute('data-max');
      
      if(mutation.type == "characterData"){

        let cell = mutation.target.parentNode.closest('td');
        
        cell.removeAttribute('data-numeric');
        cell.removeAttribute('style');

        cell.setAttribute('data-numeric',parseFloat(cell.innerText.replace('£','').replace('%','')));
      }

      Array.from(chartElement.querySelectorAll('tbody tr td[data-numeric]')).forEach((td, index) => {
        
        if(parseFloat(td.getAttribute('data-numeric')) > max){

          max = parseFloat(td.getAttribute('data-numeric'));
          attributeChange = true;

          console.log('change')
        }
      });


      if(attributeChange){

        guidelines = chartElement.getAttribute('data-guidelines') ? chartElement.getAttribute('data-guidelines').split(',') : [];
        
        // Y Axis and Guidelines
        if(guidelines){
          createChartYaxis(chartElement,min,max,guidelines);
          createChartGuidelines(chartElement,min,max,guidelines);
        }

      }

      deleteCellData(chartElement);
      setCellData(chartElement,min,max);

      // Create lines for line graph
      if(chartElement.querySelector(':scope > input[value="line"]:checked'))
        createLines(chartElement,min,max);

      // Create pies
      if(chartElement.querySelector(':scope > input[value="pie"]:checked'))
        createPies(chartElement);


      observer.observe(table, { characterData: true, attributes: true, childList: true, subtree: true });
      observer2.observe(chartElement, { attributes: true });
    }
  };
/*
  const observer = new MutationObserver(tableUpdated);
  const observer2 = new MutationObserver(attributesUpdated);

  observer.observe(table, { characterData: true, attributes: true, childList: true, subtree: true });
  observer2.observe(chartElement, { attributes: true });
*/

  if(chartElement.hasAttribute('data-series')){
    
    console.log('yes')
    createSeries(chartElement);
  }
}


function getCSVData(chartElement, csvURL){

  var request = new XMLHttpRequest();
  request.open('GET', csvURL, true);
  request.send(null);
  request.onreadystatechange = function () {

    if (request.readyState === 4 && request.status === 200) {

      var type = request.getResponseHeader('Content-Type');

      if (type.indexOf("csv") != -1) {

        const data = csvToObj(request.responseText);
        
        createTable(chartElement, data);

        return true;
      }
    }
  }
}

function csvToObj(data){

  let newRows = [];
  let rows = data.split('\n');

  rows.forEach((row, index) => {

    let newRow = [];
    let cells = row.replace('\r','').split(',');

    cells.forEach((cell, subIndex) => {
      newRow.push(cell);
    });
    
    newRows.push(newRow);
  });

  return newRows;
}

function createTable(chartElement,data){

  let min = chartElement.getAttribute('data-min');
  let max = chartElement.getAttribute('data-max');

  const newTable = document.createElement("table");
  const newThead = document.createElement("thead");
  const newTheadRow = document.createElement("tr");
  const newTbody = document.createElement("tbody");

  const chartID = `chart-${Date.now()}`;



  const chartInner = chartElement.querySelector('.chart__inner');
  let chartKey = document.createElement("div");
  let previousInput;
  chartKey.setAttribute('class','chart__key');
  chartKey.setAttribute('role','presentation');

  chartElement.insertBefore(chartKey,chartInner);


  let firstRow = data[0];

  firstRow.forEach((cell, index) => {

    const newHeading = document.createElement('th');
    newHeading.innerHTML = cell;
    newTheadRow.appendChild(newHeading);
    if(index != 0){
      previousInput = createChartKeyItem(chartID,index,cell,chartKey,chartElement,previousInput);
    }
  });

  newThead.appendChild(newTheadRow);
  newTable.appendChild(newThead);

  data.forEach((row, index) => {

    if(index != 0){
      const newRow = document.createElement('tr');
      newRow.setAttribute('data-label',row[0])
      row.forEach((cell, subindex) => {

        const newCell = document.createElement('td');
        newCell.innerHTML =  cell ? cell : 0; // Temp solution

        let callValue = parseFloat(cell.replace('£','').replace('%',''));

        newCell.setAttribute('data-numeric',callValue);
        newCell.setAttribute('data-label',firstRow[subindex]);

        newCell.innerHTML = `<span data-group="${row[0]}" data-label="${firstRow[subindex]}">${cell}</span>`;

        //const value = Number.parseFloat(td.getAttribute('data-numeric'));
        let percent = ((callValue - min)/(max)) * 100;
        if(isNaN(percent))
          percent = 0;

        let bottom = 0;

        // If the value is negative the position below the 0 line
        if(min < 0){
          bottom = Math.abs((min)/(max)*100);
          if(value < 0){
            bottom = bottom - percent;
          }
        }
        newCell.setAttribute("style",`--bottom:${bottom}%;--percent:${percent}%;--order:${10000 - parseInt(percent * 100)}`);
    
        newRow.appendChild(newCell);
      });
      newTbody.appendChild(newRow);
    }
  });

  newTable.appendChild(newTbody);

  chartElement.appendChild(newTable);

  chartElement.setAttribute('data-csv-loaded', 'true');
  chart(chartElement);
}

export const createChartKey = function(chartID, chartElement){

  const chartInner = chartElement.querySelector('.chart__inner');
  let chartKey = document.createElement("div");
  let previousInput;
  chartKey.setAttribute('class','chart__key');
  chartKey.setAttribute('role','presentation');

  chartElement.insertBefore(chartKey,chartInner);

  let headings = Array.from(chartElement.querySelectorAll('thead th'));

  headings.forEach((arrayElement, index) => {

    if(index != 0){

      previousInput = createChartKeyItem(chartID,index,arrayElement.innerText,chartKey,chartElement,previousInput);
    }

    if(index == 50){
      headings.length = index + 1;
    }
  });
}

function createChartKeyItem(chartID,index,text,chartKey,chartElement,previousInput){
  let input = document.createElement('input');
  input.setAttribute('name',`${chartID}-dataset-${index}`);
  input.setAttribute('id',`${chartID}-dataset-${index}`);
  input.setAttribute('checked',`checked`);
  input.setAttribute('type',`checkbox`);

  if(index == 1)
    chartElement.prepend(input);
  else
    chartElement.insertBefore(input,previousInput.nextSibling);

  previousInput = input;

  let label = document.createElement('label');
  label.setAttribute('class',`key`);
  label.setAttribute('for',`${chartID}-dataset-${index}`);
  label.innerHTML = `${text}`;
  chartKey.append(label);

  return previousInput;
}

export const createChartType = function(chartID,chartElement,type){

  const chartKey = chartElement.querySelector('.chart__key');
  const chartType = document.createElement('input');

  chartType.setAttribute('type','radio');
  chartType.setAttribute('name',`${chartID}-type`);
  chartType.value = type;
  chartType.setAttribute('checked','checked');

  chartElement.insertBefore(chartType, chartKey);
}


export const createChartYaxis = function(chartElement,min,max,guidelines){

  const chartInner = chartElement.querySelector('.chart__inner');

  let chartYaxis = chartElement.querySelector('.chart__yaxis');

  if(!chartYaxis){
    chartYaxis = document.createElement('div');
    chartYaxis.setAttribute('class','chart__yaxis');
  }

  chartYaxis.innerHTML = '';
  for (var i = 0; i < guidelines.length; i++) {

    const value = parseFloat(guidelines[i].replace('£','').replace('%',''));
    const percent = ((value - min) / max) * 100;

    chartYaxis.innerHTML += `<div class="axis__point" style="--percent:${percent}%;"><span>${guidelines[i]}</span></div>`;
  }

  chartInner.prepend(chartYaxis);
}

export const createChartGuidelines = function(chartElement,min,max,guidelines){

  const tableWrapper = chartElement.querySelector('.table__wrapper');
  let chartGuidelines = chartElement.querySelector('.chart__guidelines');

  if(!chartGuidelines){
    chartGuidelines = document.createElement('div');
    chartGuidelines.setAttribute('class','chart__guidelines');
  }

  chartGuidelines.innerHTML = '';
  for (var i = 0; i < guidelines.length; i++) {

    const value = parseFloat(guidelines[i].replace('£','').replace('%',''));
    const percent = ((value - min) / max) * 100;

    chartGuidelines.innerHTML += `<div class="guideline" style="--percent:${percent}%;"><span>${guidelines[i]}</span></div>`;
  }

  tableWrapper.prepend(chartGuidelines);

}


export const createTargets = function(chartElement,min,max,targets){

  let chartGuidelines = chartElement.querySelector('.chart__guidelines');

  if(!chartGuidelines){
    return;
  }

  Object.keys(targets).forEach(key => {

    const value = parseFloat(targets[key].replace('£','').replace('%',''));
    const percent = ((value - min) / max) * 100;

    if(!Number.isNaN(percent))
      chartGuidelines.innerHTML += `<div class="guideline guideline--target" style="--percent:${percent}%;"><span>${key}</span></div>`;
  });
}

export const createEvents = function(chartElement,events){

  let tbody = chartElement.querySelector('tbody');

  Object.keys(events).forEach(key => {


    const value = events[key];

    Array.from(chartElement.querySelectorAll('tbody tr[data-event]')).forEach((tr, index) => {

      tr.removeAttribute('data-event');
      tr.removeAttribute('data-right-event');
      tr.removeAttribute('data-left-event');
    });

    Array.from(chartElement.querySelectorAll('tbody tr td:first-child')).forEach((td, index) => {
      
      if(td.innerText == key){

        const parent = td.parentNode;

        parent.setAttribute('data-event',value);

        if(parent.offsetLeft > tbody.clientWidth * 0.75){

          parent.setAttribute('data-event-right','true');
        }
        else if(parent.offsetLeft < tbody.clientWidth * 0.25){

          parent.setAttribute('data-event-left','true');
        }
      }
    });
  });
}

export const deleteCellData = function(chartElement){
  Array.from(chartElement.querySelectorAll('tbody tr td')).forEach((td, index) => {
    td.removeAttribute('style');
  });
}

export const setCellData = function(chartElement,min,max){

  Array.from(chartElement.querySelectorAll('tbody tr')).forEach((tr, index) => {

    let group = tr.querySelector('td:first-child, th:first-child') ? tr.querySelector('td:first-child, th:first-child').innerHTML : '';

    // Set the data numeric value if not set
    Array.from(tr.querySelectorAll('td:not([data-numeric]):not(:first-child)')).forEach((td, index) => {
      td.setAttribute('data-numeric',parseFloat(td.innerText.replace('£','').replace('%','')));
    });

    // Set the data label value if not set
    Array.from(tr.querySelectorAll('td:not([data-label])')).forEach((td, index) => {

      td.setAttribute('data-label',chartElement.querySelectorAll('thead th')[index].innerText);
    });

    // Add css vars to cells
    Array.from(tr.querySelectorAll('td[data-numeric]:not(:first-child)')).forEach((td, index) => {

      
      const label = td.getAttribute('data-label');
      const content = td.innerHTML;

      if(!td.querySelector('span[data-group]'))
        td.innerHTML = `<span data-group="${group}" data-label="${label}">${content}</span>`;

      if(!td.hasAttribute('style')){
        

        const value = Number.parseFloat(td.getAttribute('data-numeric'));
        let percent = ((value - min)/(max)) * 100;
        let bottom = 0;

        // If the value is negative the position below the 0 line
        if(min < 0){
          bottom = Math.abs((min)/(max)*100);
          if(value < 0){
            bottom = bottom - percent;
          }
        }
        td.setAttribute("style",`--bottom:${bottom}%;--percent:${percent}%;`);
      }


    });
  });
}


function getCoordinatesForPercent(percent, pieCount) {

  // This moves the start point to the top middle point like a clock
  if(pieCount > 1)
    percent = percent - 0.25;

  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x*100, y*100];
}

export const createPies = function(chartElement){

  let returnString = '';

  let chartInner = chartElement.querySelector('.chart__inner');

  let pieWrapper = chartElement.querySelector('.pies');

  if(!pieWrapper){

    pieWrapper = document.createElement("div");
    pieWrapper.setAttribute('class','pies');

    chartInner.append(pieWrapper);

  }


  Array.from(chartElement.querySelectorAll('tbody tr')).forEach((item, index) => {

    let paths = '';
    let tooltips = '';
    let cumulativePercent = 0;
    let total = 0;
    let titleKey = item.querySelectorAll('td')[0]
    let title = titleKey.innerHTML;
    let pieCount = 0;

    // Work out the total amount
    Array.from(item.querySelectorAll('td')).forEach((cell, subindex) => {

      const display = getComputedStyle(cell).display;

      if(subindex != 0 && display != 'none'){

        let value = cell.getAttribute('data-numeric');

        value = value.replace('£','');
        value = value.replace('%','');
        value = Number.parseInt(value);

        total += value;
        pieCount++;
      }
    });

    // Create the paths
    Array.from(item.querySelectorAll('td')).forEach((cell, subindex) => {

      const display = getComputedStyle(cell).display;

      if(subindex != 0){

        let value = cell.getAttribute('data-numeric');

        value = value.replace('£','');
        value = value.replace('%','');
        value = Number.parseInt(value);

        let percent = value/total;

        const [startX, startY] = getCoordinatesForPercent(cumulativePercent,pieCount);

        // each slice starts where the last slice ended, so keep a cumulative percent
        if(display != 'none')
          cumulativePercent += percent;

        const [endX, endY] = getCoordinatesForPercent(cumulativePercent,pieCount);

        // if the slice is more than 50%, take the large arc (the long way around)
        const largeArcFlag = percent > .5 ? 1 : 0;

        // create an array and join it just for code readability
        const pathData = [
          `M ${startX} ${startY}`, // Move
          `A 100 100 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
          `L 0 0`, // Line
        ].join(' ');

        paths += `<path d="${pathData}"></path>`;
        tooltips += `<foreignObject x="-70" y="-70" width="140" height="140" ><div><span class="h5 mb-0"><span class="total d-block">${ucfirst(unsnake(title))}</span> ${ucfirst(unsnake(cell.getAttribute('data-label')))}<br/> ${cell.innerHTML}</span></div></foreignObject>`;
      }
    });

    returnString += `<div class="pie"><svg viewBox="-105 -105 210 210" preserveAspectRatio="none">${paths}${tooltips}</svg><div><span class="h5 mb-0">${title}</span></div></div>`
  });

  pieWrapper.innerHTML = returnString;
}

export const createLines = function(chartElement,min,max){


  let returnString = '';

  let tableWrapper = chartElement.querySelector('.table__wrapper');

  let linesWrapper = chartElement.querySelector('.lines');

  if(!linesWrapper){

    linesWrapper = document.createElement("div");
    linesWrapper.setAttribute('class','lines');

    tableWrapper.prepend(linesWrapper);

  }


  let items = Array.from(chartElement.querySelectorAll('tbody tr'));

  let lines = Array();
  let itemCount = items.length <= 1000 ? items.length : 1000;
  let spacer = 200/(itemCount - 1);

  // Creates the lines array from the fields array
  Array.from(chartElement.querySelectorAll('thead th')).forEach((field, index) => {

    if(index != 0){

      lines[index-1] = '';
    }
  });

  // populate the lines array from the items array
  let counter = 0;
  Array.from(chartElement.querySelectorAll('tbody tr')).forEach((item, index) => {

    const display = getComputedStyle(item).display;

    if(display != "none"){

      Array.from(item.querySelectorAll('td')).forEach((cell, subindex) => {

        if(subindex != 0){

          let value = cell.getAttribute('data-numeric');

          value = value.replace('£','');
          value = value.replace('%','');
          value = Number.parseFloat(value) - min;

          const percent = (value/max) * 100;

          let command = counter == 0 ? 'M' : 'L';

          lines[subindex-1] += `${command} ${spacer * counter} ${100-percent} `;
        }
      });

      counter++;
    }

  });

  lines.forEach((line, index) => {

    returnString += `
<svg viewBox="0 0 200 100" class="line" preserveAspectRatio="none">
  <path fill="none" d="${line}"></path>
</svg>`
  });

  linesWrapper.innerHTML = returnString;
}

const createSeries = function(chartElement){

  let currentRow = 1;
  let seriesInterval;

  let seriesControl = document.createElement('div');
  seriesControl.classList.add('series__controls')

  let seriesPlayButton = document.createElement('button');
  seriesPlayButton.innerHTML = 'Play';
  seriesPlayButton.classList.add('series__play-btn');

  let seriesPauseButton = document.createElement('button');
  seriesPauseButton.innerHTML = 'Pause';
  seriesPauseButton.classList.add('series__pause-btn');
  seriesPauseButton.classList.add('d-none');

  let seriesProgress = document.createElement('input');
  seriesProgress.setAttribute('name','series__progress');
  seriesProgress.setAttribute('type','range');
  seriesProgress.setAttribute('min',1);
  seriesProgress.setAttribute('step',1);
  seriesProgress.setAttribute('value',1);
  seriesProgress.setAttribute('max', Array.from(chartElement.querySelectorAll('tbody tr')).length);

  seriesProgress.classList.add('series__progress');

  let seriesCurrentRow = document.createElement('span');
  seriesCurrentRow.classList.add('series__current');

  seriesControl.append(seriesPlayButton);
  seriesControl.append(seriesPauseButton);
  seriesControl.append(seriesProgress);
  seriesControl.append(seriesCurrentRow);

  chartElement.append(seriesControl);

  updateCurrent(currentRow);

  function seriesPlay(){

    seriesProgress.value = currentRow;
    updateCurrent(currentRow);

    if(currentRow == Array.from(chartElement.querySelectorAll(`tbody tr:not(:nth-child(${currentRow}))`)).length + 1){
      clearInterval(seriesInterval);
      return false;
    }

    currentRow++;
  }

  function updateCurrent(index) {
    chartElement.querySelector(`tbody tr:nth-child(${index})`).classList.remove('d-none');
    seriesCurrentRow.innerHTML = chartElement.querySelector(`tbody tr:nth-child(${index})`).getAttribute('data-label');

    Array.from(chartElement.querySelectorAll(`tbody tr:not(:nth-child(${index}))`)).forEach((row, subindex) => {
      row.classList.add('d-none');
    });
  }

  
  seriesPlayButton.addEventListener('click', function() {
    seriesInterval = setInterval(seriesPlay, 1000);
    seriesPlayButton.classList.add('d-none');
    seriesPauseButton.classList.remove('d-none');
  });

  seriesPauseButton.addEventListener('click', function() {
    clearInterval(seriesInterval);
    seriesPlayButton.classList.remove('d-none');
    seriesPauseButton.classList.add('d-none');
  });
  seriesProgress.addEventListener('input', function() {
  
    clearInterval(seriesInterval);
    seriesPlayButton.classList.remove('d-none');
    seriesPauseButton.classList.add('d-none');
    let nthChild = this.value;

    updateCurrent(nthChild);

    currentRow = nthChild;
  });
}

export default chart