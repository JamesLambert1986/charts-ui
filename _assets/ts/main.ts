import { setupChart, addBasicHTMLStructure, createChartKey, createChartType} from './modules/chart';

document.addEventListener("DOMContentLoaded", function () {

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

  Array.from(document.querySelectorAll('.chart')).forEach((arrayElement:any) => {
    addBasicHTMLStructure(arrayElement);
    if(!arrayElement.querySelector('.chart__key')){
      createChartKey(arrayElement);
    }
    let type:string = arrayElement.hasAttribute('data-type') ? arrayElement.getAttribute('data-type') : 'column';
    if(!arrayElement.querySelector(':scope > [type="radio"]:checked')){
      createChartType(arrayElement,type);
    }
    intObserver.observe(arrayElement);
  });


  window.addEventListener('hashchange', function(e) {

    const hash = location.hash.replace('#','');
    let element = document.getElementById(hash);

    Array.from(document.querySelectorAll('.chart:not(.inview)')).forEach((arrayElement:any, index) => {

      intObserver.unobserve(arrayElement);
      
      setTimeout(function(){ 
        setupChart(arrayElement); 
        element?.scrollIntoView(true);
      }, 100 * index);

    });

    

  }, false);

});