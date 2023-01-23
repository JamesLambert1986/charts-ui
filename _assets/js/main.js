import chart from './modules/chart.js';
const setIntersctionObserver = function (chartElement) {
    const options = {
        rootMargin: '0px',
        threshold: 0
    };
    let callback = (entries) => {
        entries.forEach((entry) => {
            if (entry.intersectionRatio > 0) {
                chart(chartElement);
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