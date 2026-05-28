import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GAMES_REGISTRY, GameDefinition } from '../../games/games.registry';

@Component({
  selector: 'app-minijuegos',
  standalone: true,
  imports: [IonicModule, RouterLink, CommonModule],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page">
        <section class="hero-section">
          <div class="hero-bg"></div>
          <div class="hero-content">
            <ion-icon name="game-controller" class="hero-icon"></ion-icon>
            <h1 class="hero-title">Pausas guiadas</h1>
            <p class="hero-subtitle">Experiencias simples para respirar, bajar el ritmo y volver a ti.</p>
          </div>
        </section>

        <section class="section">
          <div class="status-card">
            <ion-icon name="construct-outline"></ion-icon>
            <div>
              <strong>Minijuegos en pruebas</strong>
              <p>Por ahora dejamos solo ejercicios ligeros. Las experiencias complejas volveran cuando esten pulidas.</p>
            </div>
          </div>

          @if (games.length === 0) {
            <div class="empty-state">
              <ion-icon name="game-controller-outline"></ion-icon>
              <p>No hay minijuegos disponibles en este momento.</p>
            </div>
          }

          <div class="games-list">
            @for (game of games; track game.id; let i = $index) {
              <a class="card card-game" [routerLink]="game.route">
                <div class="game-banner" [style.background]="game.color">
                  <ion-icon [name]="game.icon"></ion-icon>
                </div>
                <div class="game-body">
                  <div class="game-header">
                    <h3>{{ game.title }}</h3>
                    <span class="tag testing-tag">En pruebas</span>
                  </div>
                  <p>{{ game.description }}</p>
                  <div class="game-footer">
                    <span class="game-type"><ion-icon name="leaf-outline"></ion-icon> {{ game.gameType }}</span>
                    <button class="btn-small">Iniciar</button>
                  </div>
                </div>
              </a>
            }
          </div>
        </section>

        <div class="bottom-spacer"></div>
      </div>
    </ion-content>
  `,
  styles: [`
    .page { background: #ffffff; min-height: 100%; }
    .hero-section { position: relative; padding: 32px 20px 16px; overflow: hidden; text-align: center; }
    .hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #627eff 0%, #53c6e4 50%, #66a6da 100%); opacity: 0.06; pointer-events: none; }
    .hero-content { position: relative; }
    .hero-icon { font-size: 48px; color: var(--ion-color-primary); display: block; margin: 0 auto 8px; }
    .hero-title { font-size: 26px; font-weight: 800; color: #1f2937; margin: 0 0 4px; }
    .hero-subtitle { font-size: 14px; color: #6b7280; max-width: 280px; margin: 0 auto; line-height: 1.5; }
    .section { padding: 8px 20px 20px; }
    .card { background: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 14px; overflow: hidden; margin-bottom: 12px; }
    .status-card { display: flex; align-items: flex-start; gap: 12px; padding: 14px; margin-bottom: 14px; border-radius: 16px; background: #eef2ff; color: var(--ion-color-primary); }
    .status-card ion-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
    .status-card strong { display: block; color: #1f2937; font-size: 14px; margin-bottom: 3px; }
    .status-card p { color: #6b7280; font-size: 12px; line-height: 1.45; margin: 0; }
    .empty-state { text-align: center; padding: 40px; color: #d1d5db; }
    .empty-state ion-icon { font-size: 40px; margin-bottom: 8px; }
    .empty-state p { font-size: 14px; color: #9ca3af; }
    .games-list { display: flex; flex-direction: column; gap: 12px; }
    .card-game { text-decoration: none; display: block; }
    .game-banner { height: 100px; display: flex; align-items: center; justify-content: center; font-size: 48px; color: white; }
    .game-body { padding: 14px; }
    .game-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .game-header h3 { font-size: 16px; font-weight: 700; color: #1f2937; margin: 0; }
    .tag { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; }
    .testing-tag { background: #fef3c7; color: #b45309; }
    .game-body p { font-size: 12px; color: #6b7280; margin: 0 0 10px; line-height: 1.4; }
    .game-footer { display: flex; justify-content: space-between; align-items: center; }
    .game-type { font-size: 11px; color: #9ca3af; display: flex; align-items: center; gap: 4px; }
    .game-type ion-icon { font-size: 14px; }
    .btn-small { background: var(--ion-color-primary); color: white; border: none; padding: 8px 20px; border-radius: 8px; font-weight: 700; font-size: 13px; }
    .bottom-spacer { height: 80px; height: calc(80px + env(safe-area-inset-bottom, 0px)); }
  `],
})
export class MinijuegosComponent {
  games: GameDefinition[] = GAMES_REGISTRY.filter(game => ['respiracion', 'calma'].includes(game.id));

  difficultyColor(d: string): string {
    switch (d?.toLowerCase()) {
      case 'facil': return '#10b981';
      case 'medio': return '#f59e0b';
      case 'dificil': return '#ef4444';
      default: return '#6b7280';
    }
  }
}
