document.addEventListener("DOMContentLoaded", () => {
    // Smooth scroll (fallback para navegadores que no lo soportan por CSS)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth"
                });
            }

            // Cerrar menú móvil si está abierto (AlpineJS)
            const navWrapper = document.querySelector("header");
            if (navWrapper && navWrapper.__x) {
                navWrapper.__x.$data.open = false;
            }
        });
    });
});

// función de los botones de servicios
  document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".toggle-btn");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".service-card");
        const details = card.querySelector(".details");
        const icon = btn.querySelector("i");

        const isOpen = details.classList.contains("max-h-[500px]");

        // Cierra todas
        document.querySelectorAll(".service-card .details").forEach((d) => {
          d.classList.remove("max-h-[500px]", "opacity-100");
          d.classList.add("max-h-0", "opacity-0");
        });

        document.querySelectorAll(".toggle-btn i").forEach((ic) =>
          ic.classList.remove("rotate-180")
        );

        // Si estaba cerrada, abrir
        if (!isOpen) {
          details.classList.remove("max-h-0", "opacity-0");
          details.classList.add("max-h-[500px]", "opacity-100");
          icon.classList.add("rotate-180");
        }
      });
    });
  });