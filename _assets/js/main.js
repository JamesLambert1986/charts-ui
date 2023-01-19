import chart from './modules/chart.js';
document.addEventListener("DOMContentLoaded", function () {
    Array.from(document.querySelectorAll('.chart')).forEach((arrayElement) => {
        chart(arrayElement);
    });
});
//# sourceMappingURL=main.js.map