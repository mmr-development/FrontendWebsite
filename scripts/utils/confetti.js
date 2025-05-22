export const renderConfetti = (divs) => {
    const colors = ['#f94144', '#f3722c', '#f8961e', '#90be6d', '#43aa8b', '#577590'];
    const numPieces = 150;

    divs.forEach((div) => {
        const rect = div.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < numPieces; i++) {
            const confetti = document.createElement("div");
            confetti.className = "confetti";
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${centerX}px`;
            confetti.style.top = `${centerY}px`;

            document.body.appendChild(confetti);

            const angle = Math.random() * 2 * Math.PI;
            const speed = Math.random() * 10 + 4;

            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed;

            let x = centerX;
            let y = centerY;
            let gravity = 0.2;
            let velocityY = dy;

            (function animate() {
                x += dx;
                velocityY += gravity;
                y += velocityY;

                confetti.style.transform = `translate(${x - centerX}px, ${y - centerY}px) rotate(${Math.random() * 360}deg)`;

                if (y < window.innerHeight + 50) {
                    requestAnimationFrame(animate);
                } else {
                    confetti.style.transition = 'opacity 1s ease-out';
                    confetti.style.opacity = '0';
                    setTimeout(() => confetti.remove(), 1000);
                }
            })();
        }
    });
};