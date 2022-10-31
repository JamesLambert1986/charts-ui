import chart from './modules/chart.js';

document.addEventListener("DOMContentLoaded", function () {


    Array.from(document.querySelectorAll('.chart__wrapper')).forEach((arrayElement) => {
        chart(arrayElement);
    });
});