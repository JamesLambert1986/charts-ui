document.addEventListener("DOMContentLoaded", function () {

  var full_path = location.pathname.replace('/bbc-charts',''); 

  Array.from(document.querySelectorAll('a')).forEach((arrayElement) => {

    if(arrayElement.getAttribute('href') == `.${full_path}`)
      arrayElement.classList.add('active');

  });
});
