import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SupabaseService } from '@shared/services/supabase.service';

const EMOCIONES = [
  { nombre: 'Feliz', emoji: '😊', color: '#22c55e' },
  { nombre: 'Tranquilo', emoji: '😌', color: '#3b82f6' },
  { nombre: 'Ansioso', emoji: '😰', color: '#f59e0b' },
  { nombre: 'Triste', emoji: '😢', color: '#6366f1' },
  { nombre: 'Enojado', emoji: '😠', color: '#ef4444' },
  { nombre: 'Cansado', emoji: '😴', color: '#8b5cf6' },
  { nombre: 'Motivado', emoji: '💪', color: '#10b981' },
  { nombre: 'Agradecido', emoji: '🙏', color: '#ec4899' },
];

@Component({
  selector: 'app-emociones',
  standalone: true,
  imports: [IonicModule, FormsModule, DatePipe],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>¿Cómo te sientes?</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p class="intro">Selecciona tu estado emocional y haz seguimiento a tu bienestar</p>

      <div class="grid">
        @for (e of emociones; track e.nombre) {
          <button class="card-emoji" [class.selected]="seleccionada === e.nombre"
                  [style.--c]="e.color" (click)="seleccionar(e.nombre)">
            <span class="emoji">{{ e.emoji }}</span>
            <span class="label">{{ e.nombre }}</span>
          </button>
        }
      </div>

      @if (seleccionada) {
        <div class="form-block">
          <ion-textarea [(ngModel)]="nota" placeholder="¿Qué provocó esta emoción?" autoGrow rows="2"
                        fill="outline" label="Nota (opcional)" labelPlacement="stacked"></ion-textarea>
          <ion-button expand="block" (click)="guardar()" [disabled]="guardando" class="ion-margin-top">
            @if (guardando) {
              <ion-spinner slot="start" />
              Guardando...
            } @else {
              Registrar emoción
            }
          </ion-button>
        </div>
      }

      <div class="section">
        <h2 class="section-title">Tu historial</h2>

        @if (historial.length === 0) {
          <div class="empty">
            <p>Aún no has registrado emociones</p>
          </div>
        }

        <div class="timeline">
          @for (item of historial; track item.id) {
            <div class="tl-item">
              <div class="tl-dot" [style.--c]="getColor(item.emocion)"></div>
              <div class="tl-body">
                <div class="tl-head">
                  <span class="tl-emoji">{{ getEmoji(item.emocion) }}</span>
                  <span class="tl-name">{{ item.emocion }}</span>
                  <span class="tl-date">{{ item.created_at | date:'dd/MM/yy HH:mm' }}</span>
                </div>
                @if (item.nota) {
                  <p class="tl-note">{{ item.nota }}</p>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </ion-content>
  `,
  styles: `
    .intro { font-size: 14px; color: var(--ion-color-medium); margin-bottom: 16px; }

    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
    .card-emoji { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 4px; border-radius: 14px; border: 2px solid transparent; background: var(--ion-color-primary-contrast); cursor: pointer; transition: all 0.2s; font-family: inherit; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .card-emoji:active { transform: scale(0.94); }
    .card-emoji.selected { border-color: var(--c); background: color-mix(in srgb, var(--c) 10%, white); box-shadow: 0 2px 12px color-mix(in srgb, var(--c) 25%, transparent); }
    .emoji { font-size: 30px; line-height: 1; }
    .label { font-size: 11px; font-weight: 600; color: var(--ion-text-color); }

    .form-block { background: var(--ion-color-primary-contrast); border-radius: 14px; padding: 16px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }

    .section { margin-bottom: 20px; }
    .section-title { font-size: 18px; font-weight: 700; margin: 0 0 12px; color: var(--ion-text-color); }
    .empty { text-align: center; padding: 24px; color: var(--ion-color-medium); font-size: 14px; }

    .timeline { position: relative; padding-left: 20px; }
    .timeline::before { content: ''; position: absolute; left: 8px; top: 4px; bottom: 4px; width: 2px; background: var(--ion-color-light-shade); border-radius: 1px; }
    .tl-item { position: relative; padding-bottom: 16px; }
    .tl-dot { position: absolute; left: -16px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: var(--c, var(--ion-color-primary)); border: 2px solid var(--ion-color-primary-contrast); box-shadow: 0 0 0 2px var(--c, var(--ion-color-primary)); }
    .tl-body { background: var(--ion-color-primary-contrast); border-radius: 12px; padding: 10px 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .tl-head { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .tl-emoji { font-size: 16px; }
    .tl-name { font-size: 14px; font-weight: 600; color: var(--ion-text-color); }
    .tl-date { font-size: 11px; color: var(--ion-color-medium); margin-left: auto; }
    .tl-note { font-size: 13px; color: var(--ion-color-medium); margin: 0; line-height: 1.4; }
  `,
})
export class EmocionesComponent implements OnInit {
  private supabase = inject(SupabaseService);

  emociones = EMOCIONES;
  seleccionada = '';
  nota = '';
  guardando = false;
  historial: any[] = [];

  ngOnInit() {
    this.cargarHistorial();
  }

  seleccionar(nombre: string) {
    this.seleccionada = this.seleccionada === nombre ? '' : nombre;
  }

  async guardar() {
    if (!this.seleccionada) return;
    this.guardando = true;
    try {
      await this.supabase.client.from('user_progress').insert({
        emocion: this.seleccionada,
        nota: this.nota,
      });
      this.seleccionada = '';
      this.nota = '';
      this.cargarHistorial();
    } catch { /* ignore */ }
    this.guardando = false;
  }

  private async cargarHistorial() {
    try {
      const { data } = await this.supabase.client
        .from('user_progress')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      this.historial = data || [];
    } catch { /* ignore */ }
  }

  getEmoji(emocion: string): string {
    return EMOCIONES.find(e => e.nombre === emocion)?.emoji || '';
  }

  getColor(emocion: string): string {
    return EMOCIONES.find(e => e.nombre === emocion)?.color || 'var(--ion-color-primary)';
  }
}
