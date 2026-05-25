import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MiniGamesService } from '@shared/services/mini-games.service';

@Component({
  selector: 'app-minijuegos',
  standalone: true,
  imports: [IonicModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Minijuegos</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p class="intro">Actividades interactivas para tu bienestar emocional</p>

      @if (juegos.length === 0) {
        <ion-item>
          <ion-label class="ion-text-center ion-padding">No hay minijuegos disponibles</ion-label>
        </ion-item>
      }

      <div class="juegos-list">
        @for (juego of juegos; track juego.id) {
          <div class="juego-card">
            <div class="juego-header">
              <span class="juego-icon">{{ juego.icon || '🎮' }}</span>
              <div>
                <h3>{{ juego.title }}</h3>
                <p>{{ (juego.description || '').substring(0, 80) }}</p>
              </div>
            </div>
            <div class="juego-tags">
              <ion-badge color="tertiary">{{ juego.game_type }}</ion-badge>
              <ion-badge [color]="juego.difficulty === 'facil' ? 'success' : juego.difficulty === 'medio' ? 'warning' : 'danger'">
                {{ juego.difficulty }}
              </ion-badge>
            </div>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: `
    .intro { font-size: 14px; color: var(--ion-color-medium); margin-bottom: 16px; }
    .juegos-list { display: flex; flex-direction: column; gap: 12px; }
    .juego-card { background: var(--ion-color-primary-contrast); border-radius: 14px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .juego-header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px; }
    .juego-icon { font-size: 32px; line-height: 1; }
    .juego-header h3 { font-size: 16px; font-weight: 700; margin: 0 0 2px; }
    .juego-header p { font-size: 13px; color: var(--ion-color-medium); margin: 0; }
    .juego-tags { display: flex; gap: 6px; }
  `,
})
export class MinijuegosComponent implements OnInit {
  private gamesService = inject(MiniGamesService);
  juegos: any[] = [];

  async ngOnInit() {
    try {
      this.juegos = await this.gamesService.getActivos(20);
    } catch { /* ignore */ }
  }
}
