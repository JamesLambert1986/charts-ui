import '@testing-library/jest-dom'
import * as chart from '../_assets/ts/modules/chart';

describe('Setup chart function', () => {

  beforeEach(() => {
    
    document.body.innerHTML = `
<figure id="chart" class="chart" data-max="100" data-min="0" data-type="scatter" data-guidelines="£0,£50,£100">
  <table>
    <thead>
      <tr>
        <th>Year</th>
        <th>Growth</th>
        <th>Growth2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>2011</td>
        <td>£50.00</td>
        <td>£50.10</td>
      </tr>
      <tr>
        <td>2012</td>
        <td>£75.00</td>
        <td>£50.10</td>
      </tr>
      <tr>
        <td>2013</td>
        <td>£45.00</td>
        <td>£57.10</td>
      </tr>
      <tr>
        <td>2014</td>
        <td>£35.00</td>
        <td>£80.10</td>
      </tr>
    </tbody>
  </table>
</figure>
`;
  });

  test('should call getCSVData function and then return false', () => {
    
    let chartElement = document.getElementById('chart');
    chartElement.setAttribute('data-csv','true');
    let returnValue = chart.setupChart(chartElement);
    expect(returnValue).toBe(false);

    chartElement.setAttribute('data-csv-loaded','true');
    returnValue = chart.setupChart(chartElement);
    expect(returnValue).toBe(true);
  });

  test('should call setDataAttributesFromHTML function only once', () => {
    
    let chartElement = document.getElementById('chart');
    const spy = jest.spyOn(chart,'setDataAttributesFromHTML') 

    chart.setupChart(chartElement);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should call createBasicHTMLStructure function only once', () => {
    
    let chartElement = document.getElementById('chart');
    const spy = jest.spyOn(chart,'createBasicHTMLStructure') 

    chart.setupChart(chartElement);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should call createChartAssets function only once', () => {
    
    let chartElement = document.getElementById('chart');
    const spy = jest.spyOn(chart,'setupChartAssets') 

    chart.setupChart(chartElement);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should call setCellData function only once', () => {
    
    let chartElement = document.getElementById('chart');
    const spy = jest.spyOn(chart,'setCellData') 

    chart.setupChart(chartElement);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should call createOptionalContent function only once', () => {
    
    let chartElement = document.getElementById('chart');
    const spy = jest.spyOn(chart,'createOptionalContent') 

    chart.setupChart(chartElement);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should call setEventHandlers function only once', () => {
    
    let chartElement = document.getElementById('chart');
    const spy = jest.spyOn(chart,'setEventHandlers') 

    chart.setupChart(chartElement);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should NOT call setIntersctionObserver by default', () => {
    
    let chartElement = document.getElementById('chart');
    const spy = jest.spyOn(chart,'setIntersctionObserver') 

    chart.setupChart(chartElement);
    expect(spy).toHaveBeenCalledTimes(0);
  });
  
  test('should call setIntersctionObserver if the chart element has the chart--animate class', () => {
    
    let chartElement = document.getElementById('chart');
    chartElement.classList.add('chart--animate');

    const spy = jest.spyOn(chart,'setIntersctionObserver') 

    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver;

    chart.setupChart(chartElement);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should call createSeries function only once', () => {
    
    let chartElement = document.getElementById('chart');
    const spy = jest.spyOn(chart,'createSeries') 

    chart.setupChart(chartElement);
    expect(spy).toHaveBeenCalledTimes(1);
  });

});
