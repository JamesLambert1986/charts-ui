import setupChart from './modules/chart.js';
const setIntersctionObserver = function (chartElement) {
    const options = {
        rootMargin: '500px',
        threshold: 0
    };
    let callback = (entries) => {
        entries.forEach((entry) => {
            if (entry.intersectionRatio > 0) {
                setupChart(chartElement);
            }
        });
    };
    const intObserver = new IntersectionObserver(callback, options);
    intObserver.observe(chartElement);
};
document.addEventListener("DOMContentLoaded", function () {
    Array.from(document.querySelectorAll('.chart')).forEach((arrayElement) => {
        setIntersctionObserver(arrayElement);
    });
});
//# sourceMappingURL=main.js.map