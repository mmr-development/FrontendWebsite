import { renderConfetti } from "../utils/confetti.js";

// get type from url
const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type');

if (type === 'courier') {
    document.querySelector('#thank-you-type').innerHTML = 'courier!';
}
else if (type === 'partner') {
    document.querySelector('#thank-you-type').innerHTML = 'partner!';
} else {
    document.querySelector('#thank-you-type').innerHTML = 'ukendt!';
}

renderConfetti(document.querySelectorAll('.confetti-container'));