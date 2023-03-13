import {describe, expect, test} from '@jest/globals';
import {numberOfDays} from '../_assets/ts/modules/helpers';

describe('Count the number of days', () => {
  
  test('between 1/01/2022 to 31/12/2022 to equal 365', () => {
    expect(numberOfDays('1/01/2022', '31/12/2022')).toBe(365);
  });

  test('between 28/03/2022 to 6/04/2022 to equal 10', () => {
    expect(numberOfDays('28/03/2022', '6/04/2022')).toBe(10);
  });

  // Notice that the 32nd of march does not exist
  test('between 32/03/2022 to 6/02/2022 to throw an arror', () => {

    const subjectUnderTest = () => {
      numberOfDays('32/03/2022', '6/02/2022');
    };
    expect(subjectUnderTest).toThrow("Start date is not a valid date");
  });

  // Notice that their isn't a 13th month
  test('between 28/03/2022 to 6/13/2022 to throw an arror', () => {

    const subjectUnderTest = () => {
      numberOfDays('28/03/2022', '6/13/2022');
    };
    expect(subjectUnderTest).toThrow("End date is not a valid date");
  });

  test('between an invalid date to 6/12/2022 to throw an arror', () => {

    const subjectUnderTest = () => {
      numberOfDays('', '6/13/2022');
    };
    expect(subjectUnderTest).toThrow("Start date is not a valid date");
  });

  test('between 6/12/2022 to an invalid date to throw an arror', () => {

    const subjectUnderTest = () => {
      numberOfDays('6/12/2022', '');
    };
    expect(subjectUnderTest).toThrow("End date is not a valid date");
  });

  test('between 28/03/2022 to 6/02/2022 to throw an arror', () => {

    const subjectUnderTest = () => {
      numberOfDays('28/03/2022', '6/02/2022');
    };
    expect(subjectUnderTest).toThrow("The start date should be before the end date");
  });
});