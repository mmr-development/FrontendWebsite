import { renderTemplate } from "./rendertemplate.js";

export const renderModal = async (data) => {
    await renderTemplate(
        '../../templates/partials/c-modal.mustache',
        'c-modal',
        data
    );
    const modal = document.getElementById('c-modal');
    modal.classList.add('active');
    document.querySelectorAll('.c-modal__close').forEach((close) => {
        close.addEventListener('click', () => {
            modal.classList.remove('active');
            if(data.closeCallback) {
                data.closeCallback();
            }
        });
    });

    document.querySelectorAll('.c-modal__submit').forEach((submit) => {
        submit.addEventListener('click', () => {
            modal.classList.remove('active');
            if(data.submitCallback) {
                data.submitCallback();
            }
        });
    });
}
