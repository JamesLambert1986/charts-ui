document.addEventListener("DOMContentLoaded", function () {



    Array.from(document.querySelectorAll('#chart-options input:not([data-class])')).forEach((input, index) => {

        const inputID = input.getAttribute('id');

        var value = getComputedStyle(document.documentElement).getPropertyValue(`--${inputID}`).trim();

        if(input.getAttribute('type') == 'number')

            value = parseFloat(value);

        input.value = value;

        input.addEventListener('change', function(event) {
        
            document.documentElement.style.setProperty(`--${inputID}`, input.value);
        });

    });

    Array.from(document.querySelectorAll('#chart-options input[data-class]')).forEach((input, index) => {

        const inputID = input.getAttribute('id');
        const chart = document.getElementById('chart');

        input.addEventListener('change', function(event) {

            chart.className = 'chart';
        
            Array.from(document.querySelectorAll('#chart-options input[data-class]:checked')).forEach((checkbox, index) => {

                let checkboxID = checkbox.getAttribute('id');
                chart.classList.add(checkboxID);

            });

        });

    });

    
});