import { setupChart, createBasicHTMLStructure, createChartKey, createChartType } from './modules/chart.js';
document.addEventListener("DOMContentLoaded", function () {
    const options = {
        rootMargin: '200px',
        threshold: 0
    };
    let callback = (entries) => {
        entries.forEach((entry) => {
            if (entry.intersectionRatio > 0) {
                setupChart(entry.target);
                intObserver.unobserve(entry.target);
            }
        });
    };
    const intObserver = new IntersectionObserver(callback, options);
    Array.from(document.querySelectorAll('.chart')).forEach((arrayElement) => {
        createBasicHTMLStructure(arrayElement);
        if (!arrayElement.querySelector('.chart__key')) {
            createChartKey(arrayElement);
        }
        let type = arrayElement.hasAttribute('data-type') ? arrayElement.getAttribute('data-type') : 'column';
        if (!arrayElement.querySelector(':scope > [type="radio"]:checked')) {
            createChartType(arrayElement, type);
        }
        intObserver.observe(arrayElement);
    });
    window.addEventListener('hashchange', function () {
        const hash = location.hash.replace('#', '');
        let element = document.getElementById(hash);
        Array.from(document.querySelectorAll('.chart:not(.inview)')).forEach((arrayElement, index) => {
            intObserver.unobserve(arrayElement);
            setTimeout(function () {
                setupChart(arrayElement);
                element === null || element === void 0 ? void 0 : element.scrollIntoView(true);
            }, 100 * index);
        });
    }, false);
});
//# sourceMappingURL=main.js.map