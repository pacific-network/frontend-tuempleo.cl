document.addEventListener("DOMContentLoaded", function () {
    // Render estrellas promedio
    document.querySelectorAll(".stars").forEach(starContainer => {
        const score = parseFloat(starContainer.dataset.score || "0");
        const fullStars = Math.floor(score);
        const hasHalf = score % 1 >= 0.25 && score % 1 <= 0.75;

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement("i");
            if (i <= fullStars) {
                star.className = "fas fa-star filled";
            } else if (i === fullStars + 1 && hasHalf) {
                star.className = "fas fa-star-half-alt filled";
            } else {
                star.className = "far fa-star";
            }
            starContainer.appendChild(star);
        }
    });

    // Distribución de opiniones
    const distribucion = {
        5: 27,
        4: 15,
        3: 5,
        2: 2,
        1: 1
    };

    const breakdown = document.getElementById("rating-breakdown");

    for (let i = 5; i >= 1; i--) {
        const cantidad = distribucion[i] || 0;
        const li = document.createElement("li");

        const starRow = document.createElement("div");
        starRow.classList.add("star-row");

        for (let j = 1; j <= i; j++) {
            const star = document.createElement("i");
            star.className = "fas fa-star";
            starRow.appendChild(star);
        }

        li.appendChild(starRow);

        const count = document.createElement("span");
        count.classList.add("star-count");
        count.textContent = cantidad;
        li.appendChild(count);

        breakdown.appendChild(li);
    }
});