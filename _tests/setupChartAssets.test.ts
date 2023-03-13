import '@testing-library/jest-dom'
import * as chart from '../_assets/ts/modules/chart';

describe('Create chart assets function', () => {

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

    let chartElement = document.getElementById('chart');
    chart.createBasicHTMLStructure(chartElement);
  });

  test('should call createChartKey function once', () => {
    
    let chartElement = document.getElementById('chart');
    const spy = jest.spyOn(chart,'createChartKey');

    chart.setupChartAssets(chartElement);
    expect(spy).toHaveBeenCalledTimes(1);

    chart.setupChartAssets(chartElement);
    // should still only be one as the elements already exist
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should call createChartType function once', () => {
    
    let chartElement = document.getElementById('chart');
    const spy = jest.spyOn(chart,'createChartType');

    chart.setupChartAssets(chartElement);
    expect(spy).toHaveBeenCalledTimes(1);

    chart.setupChartAssets(chartElement);
    // should still only be one as the elements already exist
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should call createChartYaxis function', () => {
    
    let chartElement = document.getElementById('chart');
    const spy = jest.spyOn(chart,'createChartYaxis');

    chart.setupChartAssets(chartElement);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should call createChartGuidelines function', () => {
    
    let chartElement = document.getElementById('chart');
    const spy = jest.spyOn(chart,'createChartGuidelines');

    chart.setupChartAssets(chartElement);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  test('should call createTargets function', () => {
    
    let chartElement = document.getElementById('chart');
    chartElement.setAttribute('data-targets', '{"target":"target detail"}');

    const spy = jest.spyOn(chart,'createTargets');
    chart.setupChartAssets(chartElement);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should call createEvents function', () => {
    
    let chartElement = document.getElementById('chart');
    chartElement.setAttribute('data-events', '{"event":"event detail"}');

    const spy = jest.spyOn(chart,'createEvents');
    chart.setupChartAssets(chartElement);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should call createXaxis function', () => {
    
    let chartElement = document.getElementById('chart');
    chartElement.setAttribute('data-xaxis', '1,2,3');

    const spy = jest.spyOn(chart,'createXaxis');
    chart.setupChartAssets(chartElement);
    expect(spy).toHaveBeenCalledTimes(1);
  });

});
