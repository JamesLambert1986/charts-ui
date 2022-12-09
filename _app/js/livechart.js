document.addEventListener("DOMContentLoaded", function () {

  function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  let year = 2015;
  let updateChart;


  let table = document.getElementById('autoUpdate');

  if(table){
    updateChart = setInterval(function () {

      let tbody = table.querySelector('tbody');

      let growth = table.querySelector('tbody tr:last-child td:nth-child(2)');
      let growthValue = parseInt(growth.getAttribute('data-numeric')) < 120 ? parseInt(growth.getAttribute('data-numeric')) : 110;

      let growth2 = table.querySelector('tbody tr:last-child td:nth-child(3)');
      let growthValue2 = parseInt(growth2.getAttribute('data-numeric')) > 0 ? parseInt(growth2.getAttribute('data-numeric')) : 10;

      tbody.innerHTML += `<tr><td>${year++}</td><td>£${growthValue + randomIntFromInterval(-5,10)}</td><td>£${growthValue2 + randomIntFromInterval(-10,5)}</td></tr>`;

      if(year == 2051)
        clearInterval(updateChart);

    }, 3000);
  }
});
