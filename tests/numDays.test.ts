import {describe, expect, test} from '@jest/globals';
import {numDays} from '../_assets/ts/modules/chart';

describe('Count the number of days', () => {
  test('between 1/01/2022 to 31/12/2022 to equal 365', () => {
    expect(numDays('1/01/2022', '31/12/2022')).toBe(365);
  });
  test('between 28/03/2022 to 6/04/2022 to equal 10', () => {
    expect(numDays('28/03/2022', '6/04/2022')).toBe(10);
  });
});