import chart from './modules/chart';

document.addEventListener("DOMContentLoaded", function () {

  Array.from(document.querySelectorAll('.chart')).forEach((arrayElement) => {
    chart(arrayElement);
  });

});