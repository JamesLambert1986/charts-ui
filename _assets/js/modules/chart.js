import { ucfirst, unsnake } from './helpers.js';
function chart(chartElement, min, max, type, guidelines, targets, events) {
    const chartID = `chart-${Date.now()}`;
    if (chartElement.hasAttribute('data-csv') && !chartElement.hasAttribute('data-csv-loaded')) {
        let csvURL = chartElement.getAttribute('data-csv');
        let csvData = getCSVData(chartElement, csvURL);
        console.log('create the table');
        return false;
    }
    let table = chartElement.querySelector('table');
    if (typeof min == 'undefined') {
        min = chartElement.getAttribute('data-min');
    }
    if (typeof max == 'undefined') {
        max = chartElement.getAttribute('data-max');
    }
    if (typeof type == 'undefined') {
        type = chartElement.getAttribute('data-type') ? chartElement.getAttribute('data-type') : 'column';
    }
    if (typeof guidelines == 'undefined') {
        if (chartElement.hasAttribute('data-guidelines')) {
            guidelines = chartElement.getAttribute('data-guidelines').split(',');
        }
        else if (chartElement.querySelector('.chart__yaxis')) {
            chartElement.setAttribute('data-guidelines', Array.from(chartElement.querySelectorAll('.chart__yaxis .axis__point')).map((element) => element.innerText));
        }
    }
    if (typeof targets == 'undefined' && chartElement.hasAttribute('data-targets')) {
        targets = JSON.parse(chartElement.getAttribute('data-targets'));
    }
    if (typeof events == 'undefined' && chartElement.hasAttribute('data-events')) {
        events = JSON.parse(chartElement.getAttribute('data-events'));
    }
    // Wrap the table with some divs to add functionality
    if (!chartElement.querySelector('.table__wrapper')) {
        const tableWrapper = document.createElement('div');
        tableWrapper.setAttribute('class', 'table__wrapper');
        chartElement.append(tableWrapper);
        tableWrapper.append(table);
    }
    if (!chartElement.querySelector('.chart__inner')) {
        const tableWrapper = chartElement.querySelector('.table__wrapper');
        const chartInner = document.createElement('div');
        chartInner.setAttribute('class', 'chart__inner');
        chartInner.append(tableWrapper);
        chartElement.append(chartInner);
    }
    // set the longest label attr so that the bar chart knows what margin to set on the left
    let longestLabel = '';
    const chartInner = chartElement.querySelector('.chart__inner');
    Array.from(table.querySelectorAll('tbody tr td:first-child')).forEach((td) => {
        if (td.innerText.length > longestLabel.length) {
            longestLabel = td.innerText;
        }
    });
    chartInner.setAttribute('data-longest-label', longestLabel);
    // set the longest data set attr so that the bar chart knows what margin to set on the left
    let longestSet = '';
    Array.from(table.querySelectorAll('thead tr th')).forEach((td) => {
        if (td.innerText.length > longestSet.length) {
            longestSet = td.innerText;
        }
    });
    chartInner.setAttribute('data-set-label', longestSet);
    // Create chart key if the one isn't already created
    if (!chartElement.querySelector('.chart__key')) {
        createChartKey(chartElement);
    }
    // Create the required type input field if one isn't set
    if (!chartElement.querySelector(':scope > [type="radio"]:checked')) {
        createChartType(chartElement, type);
    }
    // Y Axis and Guidelines
    if (guidelines) {
        createChartYaxis(chartElement, min, max, guidelines);
        createChartGuidelines(chartElement, min, max, guidelines);
    }
    if (targets) {
        createTargets(chartElement, min, max, targets);
    }
    if (events) {
        createEvents(chartElement, events);
    }
    // Make sure table cells have enough data attached to them to display the chart data
    let secondTable = chartElement.querySelector(':scope > table');
    if (secondTable) {
        let secondMin = chartElement.getAttribute('data-second-min');
        let secondMax = chartElement.getAttribute('data-second-max');
        setCellData(chartElement, secondTable, secondMin, secondMax);
    }
    setCellData(chartElement, table, min, max, secondTable);
    // Create lines for line graph
    if (chartElement.querySelector(':scope > input[value="line"]:checked'))
        createLines(chartElement, min, max);
    // Create pies
    if (chartElement.querySelector(':scope > input:is([value="pie"],[value="polar"]):checked'))
        createPies(chartElement);
    if (chartElement.querySelector(':scope > input[value="radar"]:checked'))
        createRadar(chartElement, min, max);
    if (chartElement.querySelector(':scope > input[value="combo"]:checked')) {
        defineCellType(chartElement);
        createLines(chartElement, min, max);
    }
    if (chartElement.querySelector(':scope > input[value="treemap"]:checked'))
        setTreemapCellData(chartElement, min, max);
    // Event handlers
    const showData = chartElement.querySelectorAll(':scope > input[type="checkbox"]');
    for (var i = 0; i < showData.length; i++) {
        showData[i].addEventListener('change', function () {
            if (chartElement.querySelector(':scope > input:is([value="pie"],[value="polar"]):checked'))
                createPies(chartElement);
            if (chartElement.querySelector(':scope > input[value="treemap"]:checked')) {
                deleteCellData(chartElement);
                let newMax = 0;
                Array.from(chartElement.querySelectorAll('table tbody tr td:not(:first-child)')).forEach((td) => {
                    const display = getComputedStyle(td).display;
                    if (display != 'none') {
                        let value = td.innerHTML;
                        value = value.replace('£', '');
                        value = value.replace('%', '');
                        value = Number.parseFloat(value);
                        newMax += value;
                    }
                });
                setCellData(chartElement, table, min, newMax);
                setTreemapCellData(chartElement, min, newMax);
            }
        });
        if (chartElement.querySelector(':scope > input[value="radar"]:checked'))
            createRadar(chartElement, min, max);
    }
    if (chartElement.querySelector(':scope > input[type="radio"]')) {
        const chartTypes = chartElement.querySelectorAll(':scope > input[type="radio"]');
        for (var i = 0; i < chartTypes.length; i++) {
            chartTypes[i].addEventListener('change', function () {
                switch (this.value) {
                    case "line":
                        createLines(chartElement, min, max);
                        break;
                    case "pie":
                    case "polar":
                        createPies(chartElement);
                    case "radar":
                        createRadar(chartElement, min, max);
                        break;
                }
            });
        }
    }
    if (chartElement.hasAttribute('data-series')) {
        createSeries(chartElement);
    }
    else {
        //setEventObservers(chartElement,min,max,guidelines);
    }
    if (chartElement.classList.contains('chart--animate'))
        setIntersctionObserver(chartElement);
}
export const setEventObservers = function (chartElement, min, max, guidelines) {
    let table = chartElement.querySelector('table');
    const attributesUpdated = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.attributeName == 'class')
                continue;
            observer.disconnect();
            observer2.disconnect();
            if (mutation.type === 'childList') {
                console.log('A child node has been added or removed.');
            }
            else if (mutation.type === 'attributes') {
                console.log(`The ${mutation.attributeName} attribute was modified.`);
            }
            min = chartElement.getAttribute('data-min');
            max = chartElement.getAttribute('data-max');
            Array.from(chartElement.querySelectorAll('tbody tr td[data-numeric]')).forEach((td) => {
                if (parseFloat(td.getAttribute('data-numeric')) > max) {
                    max = parseFloat(td.getAttribute('data-numeric'));
                }
            });
            if (mutation.type === 'attributes') {
                let guidelines = chartElement.getAttribute('data-guidelines') ? chartElement.getAttribute('data-guidelines').split(',') : [];
                // Y Axis and Guidelines
                if (guidelines) {
                    createChartYaxis(chartElement, min, max, guidelines);
                    createChartGuidelines(chartElement, min, max, guidelines);
                    if (chartElement.hasAttribute('data-targets')) {
                        let targets = JSON.parse(chartElement.getAttribute('data-targets'));
                        createTargets(chartElement, min, max, targets);
                    }
                }
                if (chartElement.hasAttribute('data-events')) {
                    let events = JSON.parse(chartElement.getAttribute('data-events'));
                    createEvents(chartElement, events);
                }
                deleteCellData(chartElement);
            }
            setCellData(chartElement, table, min, max);
            // Create lines for line graph
            if (chartElement.querySelector(':scope > input[value="line"]:checked'))
                createLines(chartElement, min, max);
            // Create pies
            if (chartElement.querySelector(':scope > input[value="pie"]:checked'))
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
            if (mutation.type == "characterData") {
                let cell = mutation.target.parentNode.closest('td');
                cell.removeAttribute('data-numeric');
                cell.removeAttribute('style');
                cell.setAttribute('data-numeric', parseFloat(cell.innerText.replace('£', '').replace('%', '')));
            }
            Array.from(chartElement.querySelectorAll('tbody tr td[data-numeric]')).forEach((td) => {
                if (parseFloat(td.getAttribute('data-numeric')) > max) {
                    max = parseFloat(td.getAttribute('data-numeric'));
                    attributeChange = true;
                }
            });
            if (attributeChange) {
                guidelines = chartElement.getAttribute('data-guidelines') ? chartElement.getAttribute('data-guidelines').split(',') : [];
                // Y Axis and Guidelines
                if (guidelines) {
                    createChartYaxis(chartElement, min, max, guidelines);
                    createChartGuidelines(chartElement, min, max, guidelines);
                }
            }
            deleteCellData(chartElement);
            setCellData(chartElement, table, min, max);
            // Create lines for line graph
            if (chartElement.querySelector(':scope > input[value="line"]:checked'))
                createLines(chartElement, min, max);
            // Create pies
            if (chartElement.querySelector(':scope > input[value="pie"]:checked'))
                createPies(chartElement);
            observer.observe(table, { characterData: true, attributes: true, childList: true, subtree: true });
            observer2.observe(chartElement, { attributes: true });
        }
    };
    const observer = new MutationObserver(tableUpdated);
    const observer2 = new MutationObserver(attributesUpdated);
    observer.observe(table, { characterData: true, attributes: true, childList: true, subtree: true });
    observer2.observe(chartElement, { attributes: true });
};
export const setIntersctionObserver = function (chartElement) {
    const options = {
        rootMargin: '0px',
        threshold: 0.5
    };
    let callback = (entries) => {
        entries.forEach((entry) => {
            if (entry.intersectionRatio > 0) {
                entry.target.classList.add('inview');
                entry.target.classList.add('animating');
                setTimeout(function () {
                    entry.target.classList.remove('animating');
                }, 3000);
            }
        });
    };
    const intObserver = new IntersectionObserver(callback, options);
    intObserver.observe(chartElement);
};
// event observers 
function getCSVData(chartElement, csvURL) {
    var request = new XMLHttpRequest();
    request.open('GET', csvURL, true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            let type = request.getResponseHeader('Content-Type');
            if (type != null && type.indexOf("csv") != -1) {
                const data = csvToObj(request.responseText);
                createTable(chartElement, data);
                return true;
            }
        }
    };
}
let numDays = function (start, end) {
    let convertStart = start.split('/');
    let convertEnd = end.split('/');
    var dateStart = new Date(convertStart[1] + '/' + convertStart[0] + '/' + convertStart[2]);
    var dateEnd = new Date(convertEnd[1] + '/' + convertEnd[0] + '/' + convertEnd[2]);
    // To calculate the time difference of two dates
    var diffTime = dateEnd.getTime() - dateStart.getTime();
    return (diffTime / (1000 * 3600 * 24) + 1);
};
export const csvToObj = function (data) {
    let newRows = [];
    let rows = data.split('\n');
    rows.forEach((row, index) => {
        let newRow = [];
        let cells = row.replace('\r', '').split(',');
        cells.forEach((cell) => {
            newRow.push(cell);
        });
        newRows.push(newRow);
    });
    return newRows;
};
export const createTable = function (chartElement, data) {
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
    chartKey.setAttribute('class', 'chart__key');
    chartKey.setAttribute('role', 'presentation');
    chartElement.insertBefore(chartKey, chartInner);
    let firstRow = data[0];
    firstRow.forEach((cell, index) => {
        const newHeading = document.createElement('th');
        newHeading.innerHTML = cell;
        newTheadRow.appendChild(newHeading);
        if (index != 0) {
            previousInput = createChartKeyItem(chartID, index, cell, chartKey, chartElement, previousInput);
        }
    });
    newThead.appendChild(newTheadRow);
    newTable.appendChild(newThead);
    data.forEach((row, index) => {
        if (index != 0) {
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-label', row[0]);
            row.forEach((cell, subindex) => {
                const newCell = document.createElement('td');
                newCell.innerHTML = cell ? cell : 0; // Temp solution
                let callValue = String(parseFloat(cell.replace('£', '').replace('%', '')));
                newCell.setAttribute('data-numeric', callValue);
                newCell.setAttribute('data-label', firstRow[subindex]);
                newCell.innerHTML = `<span data-group="${row[0]}" data-label="${firstRow[subindex]}">${cell}</span>`;
                newRow.appendChild(newCell);
            });
            newTbody.appendChild(newRow);
        }
    });
    newTable.appendChild(newTbody);
    chartElement.appendChild(newTable);
    chartElement.setAttribute('data-csv-loaded', 'true');
    chart(chartElement);
};
export const createChartKey = function (chartElement) {
    const chartID = `chart-${Date.now()}`;
    const chartInner = chartElement.querySelector('.chart__inner');
    let chartKey = document.createElement("div");
    let previousInput;
    chartKey.setAttribute('class', 'chart__key');
    chartKey.setAttribute('role', 'presentation');
    chartElement.insertBefore(chartKey, chartInner);
    let headings = Array.from(chartInner.querySelectorAll('thead th'));
    headings.forEach((arrayElement, index) => {
        if (index != 0) {
            previousInput = createChartKeyItem(chartID, index, arrayElement.innerText, chartKey, chartElement, previousInput);
        }
        if (index == 50) {
            headings.length = index + 1;
        }
    });
};
function createChartKeyItem(chartID, index, text, chartKey, chartElement, previousInput) {
    let input = document.createElement('input');
    input.setAttribute('name', `${chartID}-dataset-${index}`);
    input.setAttribute('id', `${chartID}-dataset-${index}`);
    input.setAttribute('checked', `checked`);
    input.setAttribute('type', `checkbox`);
    if (index == 1)
        chartElement.prepend(input);
    else
        chartElement.insertBefore(input, previousInput.nextSibling);
    previousInput = input;
    let label = document.createElement('label');
    label.setAttribute('class', `key`);
    label.setAttribute('for', `${chartID}-dataset-${index}`);
    label.setAttribute('data-label', `${text}`);
    label.innerHTML = `${text}`;
    chartKey.append(label);
    return previousInput;
}
export const createChartType = function (chartElement, type) {
    const chartID = `chart-${Date.now()}`;
    const chartKey = chartElement.querySelector('.chart__key');
    const chartType = document.createElement('input');
    chartType.setAttribute('type', 'radio');
    chartType.setAttribute('name', `${chartID}-type`);
    chartType.value = type;
    chartType.setAttribute('checked', 'checked');
    chartElement.insertBefore(chartType, chartKey);
};
const getValues = function (value, min, max, start) {
    let cleanValue = String(value);
    cleanValue = cleanValue.replace('£', '');
    cleanValue = cleanValue.replace('%', '');
    cleanValue = cleanValue.replace(',', '');
    cleanValue = Number.parseFloat(cleanValue);
    let percent = ((cleanValue - min) / (max - min)) * 100;
    let axis = percent;
    let bottom = 0;
    if (start != 0) {
        bottom = ((start - min) / (max - min)) * 100;
    }
    // If the value is negative the position below the 0 line
    if (min < 0) {
        bottom = Math.abs(((min) / (max - min)) * 100);
        if (cleanValue < 0) {
            percent = bottom - percent;
            bottom = bottom - percent;
            axis = bottom;
        }
        else {
            percent = percent - bottom;
            axis = percent + bottom;
        }
    }
    return { percent, axis, bottom };
};
export const createChartYaxis = function (chartElement, min, max, guidelines) {
    const chartInner = chartElement.querySelector('.chart__inner');
    let increment = chartElement.getAttribute('data-increment');
    let chartYaxis = chartElement.querySelector('.chart__yaxis');
    let startDay = min;
    if (increment == "days") {
        max = numDays(min, max);
        min = 0;
    }
    if (!chartYaxis) {
        chartYaxis = document.createElement('div');
        chartYaxis.setAttribute('class', 'chart__yaxis');
    }
    chartYaxis.innerHTML = '';
    for (var i = 0; i < guidelines.length; i++) {
        let value = parseFloat(guidelines[i].replace('£', '').replace('%', ''));
        if (increment == "days") {
            value = numDays(startDay, guidelines[i]);
        }
        let { axis } = getValues(value, min, max);
        chartYaxis.innerHTML += `<div class="axis__point" style="--percent:${axis}%;"><span>${guidelines[i]}</span></div>`;
    }
    chartInner.prepend(chartYaxis);
};
export const createChartGuidelines = function (chartElement, min, max, guidelines) {
    let increment = chartElement.getAttribute('data-increment');
    const tableWrapper = chartElement.querySelector('.table__wrapper');
    let chartGuidelines = chartElement.querySelector('.chart__guidelines');
    let startDay = min;
    if (increment == "days") {
        max = numDays(min, max);
        min = 0;
    }
    if (!chartGuidelines) {
        chartGuidelines = document.createElement('div');
        chartGuidelines.setAttribute('class', 'chart__guidelines');
    }
    chartGuidelines.innerHTML = '';
    for (var i = 0; i < guidelines.length; i++) {
        let value = parseFloat(guidelines[i]);
        if (increment == "days") {
            value = numDays(startDay, guidelines[i]) - 1;
        }
        let { percent, axis } = getValues(value, min, max);
        chartGuidelines.innerHTML += `<div class="guideline" style="--percent:${axis}%;"><span>${guidelines[i]}</span></div>`;
    }
    tableWrapper.prepend(chartGuidelines);
};
export const createTargets = function (chartElement, min, max, targets) {
    let chartGuidelines = chartElement.querySelector('.chart__guidelines');
    if (!chartGuidelines) {
        return;
    }
    Object.keys(targets).forEach(key => {
        const value = parseFloat(targets[key]);
        let { axis } = getValues(value, min, max);
        if (!Number.isNaN(axis))
            chartGuidelines.innerHTML += `<div class="guideline guideline--target" style="--percent:${axis}%;"><span>${key}</span></div>`;
    });
};
export const createEvents = function (chartElement, events) {
    let tbody = chartElement.querySelector('tbody');
    Object.keys(events).forEach(key => {
        const value = events[key];
        Array.from(chartElement.querySelectorAll('tbody tr[data-event]')).forEach((tr) => {
            tr.removeAttribute('data-event');
            tr.removeAttribute('data-right-event');
            tr.removeAttribute('data-left-event');
        });
        Array.from(chartElement.querySelectorAll('tbody tr td:first-child')).forEach((td) => {
            if (td.innerText == key) {
                const parent = td.parentNode;
                parent.setAttribute('data-event', value);
                if (parent.offsetLeft > tbody.clientWidth * 0.75) {
                    parent.setAttribute('data-event-right', 'true');
                }
                else if (parent.offsetLeft < tbody.clientWidth * 0.25) {
                    parent.setAttribute('data-event-left', 'true');
                }
            }
        });
    });
};
export const deleteCellData = function (chartElement) {
    Array.from(chartElement.querySelectorAll('tbody tr')).forEach((tr) => {
        tr.removeAttribute('style');
        tr.removeAttribute('data-label');
        tr.removeAttribute('data-max');
    });
    Array.from(chartElement.querySelectorAll('tbody tr td')).forEach((td) => {
        td.removeAttribute('style');
        td.removeAttribute('data-label');
        td.removeAttribute('data-numeric');
    });
    Array.from(chartElement.querySelectorAll('tbody tr td span')).forEach((span) => {
        let content = span.innerHTML;
        let parent = span.parentNode;
        parent.innerHTML = content;
    });
};
export const setCellData = function (chartElement, table, min, max, secondTable) {
    let increment = chartElement.getAttribute('data-increment');
    let startDay = min;
    if (increment == "days") {
        max = numDays(min, max);
        min = 0;
        chartElement.querySelector('tbody').setAttribute('style', `--single-day:${((1 / max) * 100)}%;`);
    }
    Array.from(table.querySelectorAll('tbody tr')).forEach((tr, index) => {
        let group = tr.querySelector('td:first-child, th:first-child') ? tr.querySelector('td:first-child, th:first-child').innerHTML : '';
        // Set the data numeric value if not set
        Array.from(tr.querySelectorAll('td:not([data-numeric]):not(:first-child)')).forEach((td, index) => {
            let value = parseFloat(td.innerText.replace('£', '').replace('%', ''));
            let start = 0;
            if (increment == "days") {
                let dates = td.innerText.split(' - ');
                if (dates[1]) {
                    value = numDays(dates[0], dates[1]);
                    start = numDays(startDay, dates[0]) - 1;
                }
            }
            td.setAttribute('data-numeric', value);
            td.setAttribute('data-start', start);
        });
        // Set the data label value if not set
        Array.from(tr.querySelectorAll('td:not([data-label])')).forEach((td, index) => {
            td.setAttribute('data-label', table.querySelectorAll('thead th')[index].innerText);
        });
        if (tr.querySelector('[data-label="Total"]')) {
            tr.setAttribute('data-max', tr.querySelector('[data-label="Total"][data-numeric]').getAttribute('data-numeric'));
        }
        let rowMax = tr.hasAttribute('data-max') ? tr.getAttribute('data-max') : max;
        // Add a useful index css var for the use of animatons.
        tr.setAttribute('style', `--row-index: ${index + 1};`);
        if (min < 0) {
            let minBottom = Math.abs(((min) / (max - min)) * 100);
            chartElement.setAttribute('style', `--min-bottom: ${minBottom}%;`);
        }
        // Add css vars to cells
        Array.from(tr.querySelectorAll('td[data-numeric]:not(:first-child)')).forEach((td, tdIndex) => {
            const label = td.getAttribute('data-label');
            const content = td.innerHTML;
            if (!td.querySelector('span[data-group]'))
                td.innerHTML = `<span data-group="${group}" data-label="${label}">${content}</span>`;
            if (!td.hasAttribute('style')) {
                const value = Number.parseFloat(td.getAttribute('data-numeric'));
                const start = Number.parseFloat(td.getAttribute('data-start'));
                let { percent, bottom, axis } = getValues(value, min, max, start);
                let order = (10000 - Math.round(percent * 100));
                td.setAttribute('data-percent', percent);
                td.setAttribute("style", `--bottom:${bottom}%;--percent:${percent}%;--axis: ${axis}%;--order:${order};`);
                if (tr.hasAttribute('data-max')) {
                    let comparison = ((value - min) / (rowMax)) * 100;
                    order = (10000 - Math.round(comparison * 100));
                    td.setAttribute("style", `--bottom:${bottom}%;--percent:${percent}%;--axis: ${axis}%;--comparison:${comparison}%;--order:${order};`);
                }
            }
            // Second table 
            if (secondTable && secondTable.querySelector(`tbody tr:nth-child(${index + 1}) td[data-percent]:nth-child(${tdIndex + 2})`)) {
                let matchingTD = secondTable.querySelector(`tbody tr:nth-child(${index + 1}) td[data-percent]:nth-child(${tdIndex + 2})`);
                let secondPercent = matchingTD.getAttribute('data-percent');
                td.style.cssText += `--second-percent:${secondPercent}%;`;
                td.style.cssText += `--second-fraction:${(secondPercent / 100)};`;
                td.setAttribute('data-second', matchingTD.innerText);
                td.setAttribute('data-second-label', chartElement.getAttribute('data-second-label'));
                let span = td.querySelector('span');
                span.setAttribute('data-second', matchingTD.innerText);
                span.setAttribute('data-second-label', chartElement.getAttribute('data-second-label'));
                chartElement;
            }
        });
    });
};
function setTreemapCellData(chartElement, min, max) {
    let cumulativeLeft = 0;
    let cumulativeTop = 0;
    let cumulativePercent = 0;
    let trackerPercent = 0;
    let trackerReset;
    let overallPercent = 0;
    const maxLeft = 90;
    const maxPercent = 60;
    const maxOffsetPercent = 25;
    Array.from(chartElement.querySelectorAll('tbody tr')).forEach((tr, index) => {
        Array.from(tr.querySelectorAll('td[data-numeric]:not(:first-child)')).forEach((td, tdIndex) => {
            let percent = parseFloat(td.getAttribute('data-percent'));
            let width = percent;
            let height = 100;
            let i = tdIndex + 2;
            let display = getComputedStyle(td).display;
            // Add an if to check checkbox
            if (display != 'none' && cumulativeLeft > maxLeft) {
                width = 100 - cumulativeLeft;
                height = (percent / width) * 100;
                td.style.cssText += `--tm-position:absolute;--tm-width:${width}%;--tm-height:${height}%;--tm-left:${cumulativeLeft}%;--tm-top:${cumulativeTop}%;`;
                cumulativeTop += height;
            }
            else if (display != 'none' && percent > maxPercent && i != trackerReset) {
                width = percent;
                height = 100;
                cumulativeTop = 0;
                td.style.cssText += `--tm-position:absolute;--tm-width:${width}%;--tm-height:${height}%;--tm-left:${cumulativeLeft}%;--tm-top:${cumulativeTop}%;`;
                cumulativeLeft += width;
            }
            else if (display != 'none') {
                if (trackerPercent == 0) {
                    overallPercent += percent;
                    for (let t = 1; t <= 10; t++) {
                        let nextTD = tr.querySelector(`td[data-numeric]:not(:first-child):nth-child(${i + t})`);
                        if (nextTD) {
                            let nextDisplay = getComputedStyle(nextTD).display;
                            if (nextDisplay != 'none') {
                                let nextPercent = parseFloat(nextTD.getAttribute('data-percent'));
                                if (nextPercent > maxOffsetPercent) {
                                    break;
                                }
                                trackerReset = i + t;
                                overallPercent += nextPercent;
                            }
                        }
                        else {
                            break;
                        }
                        if (overallPercent > 10) {
                            break;
                        }
                    }
                }
                width = overallPercent;
                height = (percent / overallPercent) * 100;
                td.style.cssText += `--tm-position:absolute;--tm-width:${width}%;--tm-height:${height}%;--tm-left:${cumulativeLeft}%;--tm-top:${cumulativeTop}%;`;
                cumulativeTop += height;
                trackerPercent += percent;
                if (i == trackerReset || height == 100) {
                    cumulativeTop = 0;
                    cumulativeLeft += overallPercent;
                    overallPercent = 0;
                    trackerPercent = 0;
                }
            }
        });
    });
}
function getCoordinatesForPercent(percent, pieCount) {
    // This moves the start point to the top middle point like a clock
    if (pieCount > 1)
        percent = percent - 0.25;
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x * 100, y * 100];
}
export const createPies = function (chartElement) {
    let returnString = '';
    let chartInner = chartElement.querySelector('.chart__inner');
    let pieWrapper = chartElement.querySelector('.pies');
    if (!pieWrapper) {
        pieWrapper = document.createElement("div");
        pieWrapper.setAttribute('class', 'pies');
        chartInner.append(pieWrapper);
    }
    Array.from(chartInner.querySelectorAll('tbody tr')).forEach((item, index) => {
        let paths = '';
        let tooltips = '';
        let cumulativePercent = 0;
        let total = 0;
        let titleKey = item.querySelectorAll('td')[0];
        let title = titleKey.innerHTML;
        let pieCount = 0;
        // Work out the total amount
        Array.from(item.querySelectorAll('td')).forEach((cell, subindex) => {
            const display = getComputedStyle(cell).display;
            if (subindex != 0 && display != 'none') {
                let value = cell.getAttribute('data-numeric');
                value = value.replace('£', '');
                value = value.replace('%', '');
                value = Number.parseInt(value);
                total += value;
                pieCount++;
            }
        });
        // Create the paths
        Array.from(item.querySelectorAll('td')).forEach((cell, subindex) => {
            const display = getComputedStyle(cell).display;
            if (subindex != 0) {
                let value = cell.getAttribute('data-numeric');
                value = value.replace('£', '');
                value = value.replace('%', '');
                value = Number.parseInt(value);
                let percent = value / total;
                const [startX, startY] = getCoordinatesForPercent(cumulativePercent, pieCount);
                // each slice starts where the last slice ended, so keep a cumulative percent
                if (display != 'none')
                    cumulativePercent += percent;
                const [endX, endY] = getCoordinatesForPercent(cumulativePercent, pieCount);
                // if the slice is more than 50%, take the large arc (the long way around)
                const largeArcFlag = percent > .5 ? 1 : 0;
                // create an array and join it just for code readability
                const pathData = [
                    `M 0 0`,
                    `L ${startX.toFixed(0)} ${startY.toFixed(0)}`,
                    `A 100 100 0 ${largeArcFlag} 1 ${endX.toFixed(0)} ${endY.toFixed(0)}`,
                    `L 0 0`, // Line
                ].join(' ');
                paths += `<path d="${pathData}" style="${cell.getAttribute('style')} --path-index: ${subindex};"></path>`;
                tooltips += `<foreignObject x="-70" y="-70" width="140" height="140" ><div><span class="h5 mb-0"><span class="total d-block">${ucfirst(unsnake(title))}</span> ${ucfirst(unsnake(cell.getAttribute('data-label')))}<br/> ${cell.innerHTML}${cell.hasAttribute('data-second') ? `${cell.getAttribute('data-second-label')}: ${cell.getAttribute('data-second')}` : ''}</span></div></foreignObject>`;
            }
        });
        returnString += `<div class="pie"><svg viewBox="-105 -105 210 210" preserveAspectRatio="none" style="--row-index: ${index + 1};">${paths}${tooltips}</svg><div><span class="h5 mb-0">${title}</span></div></div>`;
    });
    pieWrapper.innerHTML = returnString;
};
export const createLines = function (chartElement, min, max) {
    let chartType = chartElement.getAttribute('data-type');
    let returnString = '';
    let tableWrapper = chartElement.querySelector('.table__wrapper');
    let linesWrapper = chartElement.querySelector('.lines');
    if (!linesWrapper) {
        linesWrapper = document.createElement("div");
        linesWrapper.setAttribute('class', 'lines');
        tableWrapper.prepend(linesWrapper);
    }
    let items = Array.from(chartElement.querySelectorAll('tbody tr'));
    let lines = Array();
    let commands = Array();
    let animatelines = Array();
    let itemCount = items.length <= 1000 ? items.length : 1000;
    let spacer = 200 / (itemCount - 1);
    let spacerIndent = 0;
    if (chartType == "combo") {
        spacer = 200 / (itemCount);
        spacerIndent = spacer / 2;
    }
    // Creates the lines array from the fields array
    Array.from(chartElement.querySelectorAll('thead th:not(:first-child)')).forEach((field, index) => {
        lines[index] = '';
        animatelines[index] = '';
        commands[index] = 'M';
    });
    // populate the lines array from the items array
    let counter = 0;
    Array.from(chartElement.querySelectorAll('tbody tr')).forEach((item, index) => {
        const display = getComputedStyle(item).display;
        if (display != "none") {
            Array.from(item.querySelectorAll('td:not(:first-child)')).forEach((cell, subindex) => {
                if (!cell.classList.contains('chart__bar')) {
                    let value = cell.getAttribute('data-numeric');
                    let { axis } = getValues(value, min, max);
                    if (!Number.isNaN(axis)) {
                        lines[subindex] += `${commands[subindex]} ${(spacerIndent) + (spacer * counter)} ${100 - axis} `;
                        animatelines[subindex] += `${commands[subindex]} ${spacer * counter} 100 `;
                        commands[subindex] = 'L';
                    }
                    else {
                        commands[subindex] = 'M';
                    }
                }
            });
            counter++;
        }
    });
    lines.forEach((line, index) => {
        returnString += `
<svg viewBox="0 0 200 100" class="line" preserveAspectRatio="none">
  <path fill="none" d="${line}" style="--path: path('${animatelines[index]}');"></path>
</svg>`;
    });
    linesWrapper.innerHTML = returnString;
};
export const createSeries = function (chartElement) {
    let currentRow = 1;
    let seriesInterval;
    let seriesControl = document.createElement('div');
    seriesControl.classList.add('series__controls');
    let seriesPlayButton = document.createElement('button');
    seriesPlayButton.innerHTML = 'Play';
    seriesPlayButton.classList.add('series__play-btn');
    let seriesPauseButton = document.createElement('button');
    seriesPauseButton.innerHTML = 'Pause';
    seriesPauseButton.classList.add('series__pause-btn');
    seriesPauseButton.classList.add('d-none');
    let seriesProgress = document.createElement('input');
    seriesProgress.setAttribute('name', 'series__progress');
    seriesProgress.setAttribute('type', 'range');
    seriesProgress.setAttribute('min', '1');
    seriesProgress.setAttribute('step', '1');
    seriesProgress.setAttribute('value', '1');
    seriesProgress.setAttribute('max', String(Array.from(chartElement.querySelectorAll('tbody tr')).length));
    seriesProgress.classList.add('series__progress');
    let seriesCurrentRow = document.createElement('span');
    seriesCurrentRow.classList.add('series__current');
    seriesControl.append(seriesPlayButton);
    seriesControl.append(seriesPauseButton);
    seriesControl.append(seriesProgress);
    seriesControl.append(seriesCurrentRow);
    chartElement.append(seriesControl);
    updateCurrent(currentRow);
    function seriesPlay() {
        seriesProgress.value = currentRow;
        updateCurrent(currentRow);
        if (currentRow == Array.from(chartElement.querySelectorAll(`tbody tr:not(:nth-child(${currentRow}))`)).length + 1) {
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
    seriesPlayButton.addEventListener('click', function () {
        seriesInterval = setInterval(seriesPlay, 1000);
        seriesPlayButton.classList.add('d-none');
        seriesPauseButton.classList.remove('d-none');
    });
    seriesPauseButton.addEventListener('click', function () {
        clearInterval(seriesInterval);
        seriesPlayButton.classList.remove('d-none');
        seriesPauseButton.classList.add('d-none');
    });
    seriesProgress.addEventListener('input', function () {
        clearInterval(seriesInterval);
        seriesPlayButton.classList.remove('d-none');
        seriesPauseButton.classList.add('d-none');
        let nthChild = this.value;
        updateCurrent(nthChild);
        currentRow = parseInt(nthChild);
    });
};
export const createRadar = function (chartElement, min, max) {
    let returnString = '';
    let tableWrapper = chartElement.querySelector('.table__wrapper');
    let radarWrapper = chartElement.querySelector('.radar');
    let radarGuidelines = chartElement.querySelector('.radar__guidelines');
    if (!radarWrapper) {
        radarWrapper = document.createElement("div");
        radarWrapper.setAttribute('class', 'radar');
        tableWrapper.prepend(radarWrapper);
    }
    let items = Array.from(chartElement.querySelectorAll('tbody tr'));
    let lines = Array();
    let animateLines = Array();
    let itemCount = items.length <= 1000 ? items.length : 1000;
    let spacer = 100 / (itemCount - 1);
    // Creates the lines array from the fields array
    Array.from(chartElement.querySelectorAll('thead th')).forEach((field, index) => {
        if (index != 0) {
            lines[index - 1] = '';
            animateLines[index - 1] = '';
        }
    });
    // populate the lines array from the items array
    let counter = 0;
    Array.from(chartElement.querySelectorAll('tbody tr')).forEach((item) => {
        const display = getComputedStyle(item).display;
        if (display != "none") {
            Array.from(item.querySelectorAll('td')).forEach((cell, subindex) => {
                if (subindex != 0) {
                    let value = cell.getAttribute('data-numeric');
                    let { axis } = getValues(value, min, max);
                    let command = counter == 0 ? 'M' : 'L';
                    let x = 50;
                    let y = 50 - (axis / 2);
                    let deg = 360 / itemCount;
                    var angleInRadians = ((deg * counter) - 90) * Math.PI / 180.0;
                    if (counter != 0) {
                        x = 50 + (((axis / 2)) * Math.cos(angleInRadians));
                        y = 50 + (((axis / 2)) * Math.sin(angleInRadians));
                    }
                    lines[subindex - 1] += `${command} ${x} ${y} `;
                    animateLines[subindex - 1] += `${command} 50 50 `;
                }
            });
            counter++;
        }
    });
    lines.forEach((line, index) => {
        returnString += `
<svg viewBox="0 0 100 100" class="line" preserveAspectRatio="none">
  <path fill="none" d="${line}z" style="--path: path('${animateLines[index]}z')"></path>
</svg>`;
    });
    radarWrapper.innerHTML = returnString;
    // guidelines
    if (!radarGuidelines) {
        radarGuidelines = document.createElement("div");
        radarGuidelines.setAttribute('class', 'radar__guidelines');
        tableWrapper.prepend(radarGuidelines);
    }
    Array.from(chartElement.querySelectorAll('.chart__guidelines .guideline')).forEach((guideline, index) => {
        let value = guideline.innerText;
        let { percent, axis } = getValues(value, min, max);
        let line = '';
        Array.from(chartElement.querySelectorAll('tbody tr')).forEach((row, index) => {
            let command = index == 0 ? 'M' : 'L';
            let x = 50;
            let y = 50 - (axis / 2);
            let deg = 360 / itemCount;
            var angleInRadians = ((deg * index) - 90) * Math.PI / 180.0;
            if (counter != 0) {
                x = 50 + (((axis / 2)) * Math.cos(angleInRadians));
                y = 50 + (((axis / 2)) * Math.sin(angleInRadians));
            }
            line += `${command} ${x} ${y} `;
        });
        let returnString = `
    <svg viewBox="0 0 100 100" class="line" preserveAspectRatio="none">
      <path fill="none" d="${line}z"></path>
    </svg>`;
        radarGuidelines.innerHTML += returnString;
    });
};
export const defineCellType = function (chartElement) {
    let rows = chartElement.getAttribute('data-lines').split(',');
    rows.forEach((row, subIndex) => {
        Array.from(chartElement.querySelectorAll(`tbody tr td:nth-child(${row})`)).forEach((cell, index) => {
            cell.classList.add('chart__point');
        });
    });
    Array.from(chartElement.querySelectorAll(`tbody tr td:not(.chart__point)`)).forEach((cell, index) => {
        cell.classList.add('chart__bar');
    });
};
export default chart;
//# sourceMappingURL=chart.js.map