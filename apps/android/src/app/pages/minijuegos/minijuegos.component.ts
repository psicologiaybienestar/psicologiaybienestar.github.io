import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { GAMES_REGISTRY, GameDefinition } from '../../games/games.registry';

@Component({
  selector: 'app-minijuegos',
  standalone: true,
  imports: [IonicModule, RouterLink],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Minijuegos</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p class="page-intro">Actividades interactivas para tu bienestar emocional</p>

      @if (games.length === 0) {
        <div class="glass-card empty">
          <ion-icon name="game-controller-outline" class="empty-icon"></ion-icon>
          <p>No hay minijuegos disponibles</p>
        </div>
      }

      <div class="list">
        @for (game of games; track game.id) {
          <a class="glass-card card" [routerLink]="game.route">
            <div class="icon-wrap" [style.--c]="game.color">
              <ion-icon [name]="game.icon" class="card-icon"></ion-icon>
            </div>
            <div class="body">
              <h3>{{ game.title }}</h3>
              <p>{{ game.description }}</p>
              <div class="tags">
                <ion-badge color="tertiary">{{ game.gameType }}</ion-badge>
                <ion-badge [color]="difficultyColor(game.difficulty)">{{ game.difficulty }}</ion-badge>
              </div>
            </div>
            <ion-icon name="chevron-forward-outline" class="chevron"></ion-icon>
          </a>
        }
      </div>
    </ion-content>
  `,
  styles: `
    .empty { text-align: center; padding: var(--pg-space-2xl); }
    .empty-icon { font-size: 48px; display: block; margin-bottom: var(--pg-space-md); opacity: 0.3; }
    .empty p { font-size: 14px; color: var(--ion-color-medium); margin: 0; }

    .list { display: flex; flex-direction: column; gap: var(--pg-space-md); }
    .card { display: flex; gap: var(--pg-space-md); align-items: center; padding: var(--pg-space-lg); text-decoration: none; cursor: pointer; transition: var(--pg-transition); }
    .card:active { transform: scale(0.98); }
    .icon-wrap { width: 48px; height: 48px; border-radius: var(--pg-radius-md); background: color-mix(in srgb, var(--c) 15%, white); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .card-icon { font-size: 24px; color: var(--c); }
    .body { flex: 1; min-width: 0; }
    .body h3 { font-size: 16px; font-weight: 700; margin: 0 0 4px; color: var(--ion-text-color); }
    .body p { font-size: 13px; color: var(--ion-color-medium); margin: 0 0 var(--pg-space-sm); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .tags { display: flex; gap: var(--pg-space-xs); flex-wrap: wrap; }
    .tags ion-badge { font-size: 11px; font-weight: 600; }
    .chevron { font-size: 18px; color: var(--ion-color-medium-shade); flex-shrink: 0; }
  `,
})
export class MinijuegosComponent {
  games: GameDefinition[] = GAMES_REGISTRY;

  difficultyColor(d: string): string {
    switch (d?.toLowerCase()) {
      case 'fácil': case 'facil': return 'success';
      case 'medio': return 'warning';
      case 'difícil': case 'dificil': return 'danger';
      default: return 'medium';
    }
  }
}
