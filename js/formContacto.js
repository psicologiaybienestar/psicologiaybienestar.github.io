lucide.createIcons();

const form = document.getElementById("contactForm");
const successMessage = document.getElementById("successMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const action = form.getAttribute("action");

  const response = await fetch(action, {
    method: "POST",
    body: data,
    headers: { Accept: "application/json" },
  });

  if (response.ok) {
    form.reset();
    successMessage.classList.remove("hidden");
    setTimeout(() => {
      successMessage.classList.add("hidden");
    }, 5000);
  }
});
