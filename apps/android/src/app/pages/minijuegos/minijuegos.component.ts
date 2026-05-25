import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SlicePipe } from '@angular/common';
import { MiniGamesService } from '@shared/services/mini-games.service';

const GAME_ICONS: Record<string, string> = {
  respiracion: '🌬️',
  afirmaciones: '💭',
  gratitud: '🌟',
  memoria: '🧠',
  sopa: '🔍',
  puzzle: '🧩',
  colorear: '🎨',
  respiración: '🌬️',
};

@Component({
  selector: 'app-minijuegos',
  standalone: true,
  imports: [IonicModule, SlicePipe],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Minijuegos</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p class="intro">Actividades interactivas para tu bienestar emocional</p>

      @if (juegos.length === 0) {
        <div class="empty">
          <span class="empty-icon">🎮</span>
          <p>No hay minijuegos disponibles</p>
        </div>
      }

      <div class="list">
        @for (juego of juegos; track juego.id) {
          <div class="card">
            <span class="icon">{{ GAME_ICONS[juego.game_type?.toLowerCase()] || '🎮' }}</span>
            <div class="body">
              <h3>{{ juego.title }}</h3>
              @if (juego.description) {
                <p>{{ juego.description.length > 80 ? (juego.description | slice:0:80) + '...' : juego.description }}</p>
              }
              <div class="tags">
                <ion-badge color="tertiary">{{ juego.game_type }}</ion-badge>
                <ion-badge [color]="difficultyColor(juego.difficulty)">{{ juego.difficulty }}</ion-badge>
              </div>
            </div>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: `
    .intro { font-size: 14px; color: var(--ion-color-medium); margin-bottom: 16px; }

    .empty { text-align: center; padding: 40px 16px; }
    .empty-icon { font-size: 48px; display: block; margin-bottom: 12px; }
    .empty p { font-size: 14px; color: var(--ion-color-medium); margin: 0; }

    .list { display: flex; flex-direction: column; gap: 12px; }
    .card { display: flex; gap: 14px; background: var(--ion-color-primary-contrast); border-radius: 14px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .icon { font-size: 36px; line-height: 1; flex-shrink: 0; margin-top: 2px; }
    .body { flex: 1; min-width: 0; }
    .body h3 { font-size: 16px; font-weight: 700; margin: 0 0 4px; color: var(--ion-text-color); }
    .body p { font-size: 13px; color: var(--ion-color-medium); margin: 0 0 8px; line-height: 1.4; }
    .tags { display: flex; gap: 6px; flex-wrap: wrap; }
    .tags ion-badge { font-size: 11px; font-weight: 600; }
  `,
})
export class MinijuegosComponent implements OnInit {
  private gamesService = inject(MiniGamesService);

  GAME_ICONS = GAME_ICONS;
  juegos: any[] = [];

  async ngOnInit() {
    try {
      this.juegos = await this.gamesService.getActivos(20);
    } catch { /* ignore */ }
  }

  difficultyColor(d: string): string {
    switch (d?.toLowerCase()) {
      case 'fácil': case 'facil': return 'success';
      case 'medio': return 'warning';
      case 'difícil': case 'dificil': return 'danger';
      default: return 'medium';
    }
  }
}
