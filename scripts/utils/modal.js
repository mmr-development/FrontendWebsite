import { renderTemplate } from "./rendertemplate.js";

export const renderModal = async (data, containerid = 'c-modal') => {
    await renderTemplate(
        '../../templates/partials/c-modal.mustache',
        containerid,
        data
    );
    const modal = document.getElementById(containerid);
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
            if (data.submitCallback) {
                data.submitCallback();
            }
            // By default, close modal unless submitClose is explicitly false
            if (data.submitClose !== false) {
                modal.classList.remove('active');
            }
        });
    });
}
