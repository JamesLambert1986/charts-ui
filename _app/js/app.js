document.addEventListener("DOMContentLoaded", function () {

  var full_path = location.pathname.replace('/charts-ui',''); 

  Array.from(document.querySelectorAll('a')).forEach((arrayElement) => {

    if(arrayElement.getAttribute('href') == `.${full_path}`)
      arrayElement.classList.add('active');

  });
});
