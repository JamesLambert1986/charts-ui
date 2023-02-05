import setupChart from './modules/chart';

const setIntersctionObserver = function(chartElement:any) {

  const options = {
    rootMargin: '200px',
    threshold: 0
  }

  let callback = (entries:any) => {
    entries.forEach((entry:any) => {
      
      if(entry.intersectionRatio > 0){
        setupChart(entry.target);
        intObserver.unobserve(entry.target);
      }
    });
  };

  const intObserver = new IntersectionObserver(callback, options);
  intObserver.observe(chartElement);
}

document.addEventListener("DOMContentLoaded", function () {

  Array.from(document.querySelectorAll('.chart')).forEach((arrayElement:any) => {
    setIntersctionObserver(arrayElement);
  });
});