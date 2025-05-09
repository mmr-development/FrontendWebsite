// on form submit redirect to restaurants page
import * as api from '../utils/api.js';

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("restaurant-form");
    const addressInput = document.getElementById("adresse");
    const submitButton = document.getElementById("submit-button");
    let addressdata = {};

    submitButton.style.display = "none"; // Hide the submit button initially

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            window.location.href = 'pages/restaurants.html?' + new URLSearchParams(addressdata);
        });
    }

    if (addressInput) {
        dawaAutocomplete.dawaAutocomplete(addressInput, {
            select: function (selected) {
                console.log(selected);
                if (addressInput) {
                    addressInput.innerHTML = selected.tekst;
                    submitButton.style.display = "block";
                    addressdata = {
                        city: selected.data.postnrnavn.split(" ")[0]
                    };
                }
            },
        });
        addressInput.addEventListener("input", function () {
            submitButton.style.display = "none";
        });
    }
});
