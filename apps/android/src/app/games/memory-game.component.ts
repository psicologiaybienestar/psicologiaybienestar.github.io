import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppIconComponent } from '@shared/components/app-icon.component';

interface Card {
  id: number;
  icon: string;
  color: string;
  flipped: boolean;
  matched: boolean;
}

const CARD_SET = [
  { icon: 'happy-outline', color: '#22c55e' },
  { icon: 'heart-outline', color: '#ec4899' },
  { icon: 'sunny-outline', color: '#f59e0b' },
  { icon: 'moon-outline', color: '#6366f1' },
  { icon: 'water-outline', color: '#3b82f6' },
  { icon: 'flame-outline', color: '#ef4444' },
  { icon: 'leaf-outline', color: '#10b981' },
  { icon: 'sparkles-outline', color: '#8b5cf6' },
];

@Component({
  selector: 'app-memory-game',
  standalone: true,
  imports: [IonicModule, AppIconComponent],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/minijuegos"></ion-back-button>
        </ion-buttons>
        <ion-title>Memoria Emocional</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="reiniciar()">
            <app-icon name="refresh-outline"></app-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <div class="game-stats">
          <span class="stat">Intentos: {{ intentos }}</span>
          <span class="stat">Pares: {{ paresEncontrados }}/{{ totalPares }}</span>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="board">
        @for (card of cards; track card.id) {
          <button class="card" [class.flipped]="card.flipped || card.matched" [class.matched]="card.matched"
                  (click)="flipCard(card)" [disabled]="blocked || card.flipped || card.matched">
            @if (card.flipped || card.matched) {
              <app-icon [name]="card.icon" [style.color]="card.color" class="card-icon"></app-icon>
            } @else {
              <div class="card-back">
                <app-icon name="help-outline" class="card-back-icon"></app-icon>
              </div>
            }
          </button>
        }
      </div>

      @if (completado) {
        <div class="overlay">
          <div class="modal glass-card-strong animate-scaleIn">
            <app-icon name="trophy-outline" class="trophy"></app-icon>
            <h2>Completado!</h2>
            <p>Lo lograste en {{ intentos }} intentos</p>
            <ion-button expand="block" (click)="reiniciar()" class="modal-btn gradient-primary">Jugar de nuevo</ion-button>
            <ion-button expand="block" fill="clear" routerLink="/minijuegos" class="modal-back">Volver</ion-button>
          </div>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .game-stats { display: flex; justify-content: space-between; padding: 0 20px 10px; font-size: 13px; color: var(--ion-color-medium); font-weight: 500; }

    .board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 16px; max-width: 400px; margin: 0 auto; }

    .card { aspect-ratio: 1; border-radius: var(--pg-radius-md); border: 2px solid var(--ion-color-light-shade); background: var(--ion-color-primary-contrast); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.25s; font-family: inherit; box-shadow: var(--pg-shadow-sm); }
    .card:active:not(.flipped):not(.matched) { transform: scale(0.92); }
    .card.flipped { border-color: var(--ion-color-primary); background: color-mix(in srgb, var(--ion-color-primary) 8%, white); box-shadow: var(--pg-elevation-1); }
    .card.matched { border-color: #22c55e; background: color-mix(in srgb, #22c55e 10%, white); opacity: 0.7; transform: scale(0.95); }
    .card-icon { font-size: 32px; }
    .card-back { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    .card-back-icon { font-size: 28px; color: var(--ion-color-medium-shade); }

    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px; }
    .modal { padding: 32px 24px; text-align: center; max-width: 300px; width: 100%; }
    .trophy { font-size: 56px; color: #f59e0b; margin-bottom: 12px; }
    .modal h2 { font-size: 22px; font-weight: 700; margin: 0 0 4px; color: var(--ion-text-color); }
    .modal p { font-size: 14px; color: var(--ion-color-medium); margin: 0 0 20px; }
    .modal-btn { --background: var(--pg-gradient-primary); --border-radius: var(--pg-radius-md); font-weight: 600; margin-bottom: 8px; }
    .modal-back { --color: var(--ion-color-medium); }
  `],
})
export class MemoryGameComponent implements OnInit {
  private router = inject(Router);

  cards: Card[] = [];
  intentos = 0;
  paresEncontrados = 0;
  totalPares = CARD_SET.length;
  completado = false;
  blocked = false;
  firstPick: Card | null = null;

  ngOnInit() { this.iniciarJuego(); }

  private iniciarJuego() {
    const deck: Card[] = [];
    CARD_SET.forEach((c, i) => {
      deck.push({ id: i * 2, icon: c.icon, color: c.color, flipped: false, matched: false });
      deck.push({ id: i * 2 + 1, icon: c.icon, color: c.color, flipped: false, matched: false });
    });
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    this.cards = deck;
    this.intentos = 0; this.paresEncontrados = 0; this.completado = false; this.firstPick = null;
  }

  flipCard(card: Card) {
    if (this.blocked || card.flipped || card.matched) return;
    card.flipped = true;
    if (!this.firstPick) { this.firstPick = card; return; }
    this.intentos++;
    const second = this.firstPick; this.firstPick = null;
    if (second.icon === card.icon) {
      second.matched = true; card.matched = true; this.paresEncontrados++;
      if (this.paresEncontrados === this.totalPares) this.completado = true;
      return;
    }
    this.blocked = true;
    setTimeout(() => { second.flipped = false; card.flipped = false; this.blocked = false; }, 800);
  }

  reiniciar() { this.iniciarJuego(); }
}