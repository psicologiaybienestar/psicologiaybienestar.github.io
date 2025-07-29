const icons = [
  `<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3C7.03 3 2.94 7.3 3 12.25c.06 4.43 3.45 7.71 8.12 8.7.64.13 1.3-.21 1.46-.85l.57-2.18a1 1 0 00-.73-1.2l-2.3-.62a1 1 0 01-.7-.96V14a1 1 0 011-1h1.6a1 1 0 001-1v-1.6a1 1 0 011-1h1.6a1 1 0 001-1V6a1 1 0 00-1-1h-1.6a1 1 0 01-1-1V3z"/></svg>`,
  `<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 20l-4-4h8l-4 4zM4 8l8 8 8-8M4 4h16"/></svg>`,
  `<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z"/></svg>`,
  `<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 01-6 0m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  `<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75a3 3 0 114.5 0m-4.5 0h4.5m-9 3.75a9 9 0 1118 0 9 9 0 01-18 0z"/></svg>`,
];

const container = document.getElementById("svgRain");
for (let i = 0; i < 30; i++) {
  const icon = document.createElement("div");
  icon.innerHTML = icons[Math.floor(Math.random() * icons.length)];
  icon.classList.add("absolute", "text-[#627eff]/10", "animate-icon-float");
  icon.style.left = `${Math.random() * 100}%`;
  icon.style.top = `${Math.random() * 100}%`;
  icon.style.animationDuration = `${8 + Math.random() * 6}s`;
  icon.style.transform = `scale(${0.8 + Math.random() * 0.6})`;
  container.appendChild(icon);
}
