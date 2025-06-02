import * as api from '../utils/api.js';

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("restaurant-form");
    const addressInput = document.getElementById("adresse");
    const submitButton = document.getElementById("submit-button");
    let addressdata = {};

    submitButton.style.display = "none";

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            window.location.href = 'pages/restaurants.html?' + new URLSearchParams(addressdata);
        });
    }

    if (addressInput) {
        let savedAddress = sessionStorage.getItem('address') 
        ? JSON.parse(sessionStorage.getItem('address')).tekst 
        : '';
        if (savedAddress) {
            addressInput.value = savedAddress;
            submitButton.style.display = "block";
        }

        dawaAutocomplete.dawaAutocomplete(addressInput, {
            select: function (selected) {
                if (addressInput) {
                    addressInput.innerHTML = selected.tekst;
                    submitButton.style.display = "block";
                    addressdata = {
                        city: selected.data.postnrnavn.split(" ")[0]
                    };
                    selected.data.longitude = selected.data.y;
                    selected.data.latitude = selected.data.x;
                    sessionStorage.setItem('address', JSON.stringify(selected));
                }
            },
        });
        addressInput.addEventListener("input", function () {
            submitButton.style.display = "none";
        });
    }
});
