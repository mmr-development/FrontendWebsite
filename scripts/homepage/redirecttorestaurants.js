// on form submit redirect to restaurants page
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("restaurant-form");
    const addressInput = document.getElementById("adresse");
    const submitButton = document.getElementById("submit-button");

    submitButton.style.display = "none"; // Hide the submit button initially

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const formData = new FormData(form);
            const queryString = new URLSearchParams(formData).toString();
            window.location.href = `/pages/restaurants.html?${queryString}`;
        });
    }

    if (addressInput) {
        dawaAutocomplete.dawaAutocomplete(addressInput, {
            select: function (selected) {
                if (addressInput) {
                    addressInput.innerHTML = selected.tekst;
                    submitButton.style.display = "block";
                }
            },
        });
        addressInput.addEventListener("input", function () {
            submitButton.style.display = "none";
        });
    }
});
