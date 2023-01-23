import '@testing-library/jest-dom'
import chart from '../_assets/ts/modules/chart';

describe('Create chart', () => {

  test('uses jest-dom', () => {
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

    chart(chartElement);

    const chartInner = document.querySelector('.chart__inner');


    expect(typeof chartInner).toBe('object');
  })
});


