import { Component } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  template: `
    <button
      (click)="scrollToTop()"
      class="md:hidden fixed bottom-24 right-6 z-40 bg-primary text-white p-2.5 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110"
      aria-label="Volver arriba"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  `,
})
export class ScrollToTopComponent {
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
