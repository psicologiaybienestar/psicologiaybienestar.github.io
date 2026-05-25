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
      <p class="intro">Registra tu estado emocional y haz seguimiento a tu bienestar</p>

      <div class="emociones-grid">
        @for (emoji of emociones; track emoji.nombre) {
          <button class="emoji-card" [class.selected]="seleccionada === emoji.nombre"
                  [style.--card-color]="emoji.color" (click)="seleccionar(emoji.nombre)">
            <span class="emoji-icon">{{ emoji.emoji }}</span>
            <span class="emoji-label">{{ emoji.nombre }}</span>
          </button>
        }
      </div>

      @if (seleccionada) {
        <ion-item>
          <ion-label position="stacked">Nota (opcional)</ion-label>
          <ion-textarea [(ngModel)]="nota" placeholder="¿Qué provocó esta emoción?" rows={2} />
        </ion-item>

        <ion-button expand="block" (click)="guardar()" [disabled]="guardando">
          {{ guardando ? 'Guardando...' : 'Registrar emoción' }}
        </ion-button>
      }

      <ion-list-header class="ion-padding-top">
        <ion-label>Tu historial</ion-label>
      </ion-list-header>

      @if (historial.length === 0) {
        <ion-item>
          <ion-label class="ion-text-center ion-padding">Aún no has registrado emociones</ion-label>
        </ion-item>
      }
      @for (item of historial; track item.id) {
        <ion-item>
          <ion-label>
            <h2>{{ item.emocion }} {{ getEmoji(item.emocion) }}</h2>
            @if (item.nota) { <p>{{ item.nota }}</p> }
            <p class="fecha">{{ item.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
          </ion-label>
        </ion-item>
      }
    </ion-content>
  `,
  styles: `
    .intro { font-size: 14px; color: var(--ion-color-medium); margin-bottom: 16px; }
    .emociones-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px; }
    .emoji-card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 4px; border-radius: 14px; border: 2px solid transparent; background: var(--ion-color-primary-contrast); cursor: pointer; transition: all 0.2s; font-family: inherit; }
    .emoji-card:active { transform: scale(0.95); }
    .emoji-card.selected { border-color: var(--card-color); background: color-mix(in srgb, var(--card-color) 10%, white); }
    .emoji-icon { font-size: 28px; line-height: 1; }
    .emoji-label { font-size: 11px; font-weight: 600; color: var(--ion-text-color); }
    .fecha { font-size: 11px; color: var(--ion-color-medium); margin-top: 4px; }
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
}
