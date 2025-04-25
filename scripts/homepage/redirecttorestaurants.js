// on form submit redirect to restaurants page
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("restaurant-form");
    if (form) {
        form.addEventListener("submit", function(event) {
            event.preventDefault(); 
            window.location.href = "/pages/restaurants.html?" + new URLSearchParams(new FormData(form)).toString();
        });
    }
});
