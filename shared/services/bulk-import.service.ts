import { Injectable, inject } from '@angular/core';
import * as XLSX from 'xlsx';
import { SupabaseService } from './supabase.service';
import { ImportColumn, ImportTableConfig, ImportResult } from '../interfaces';

const TABLE_CONFIGS: Record<string, ImportTableConfig> = {
  motivational_quotes: {
    table: 'motivational_quotes',
    columns: [
      { key: 'quote', label: 'quote', required: true },
      { key: 'author', label: 'author', required: false },
      { key: 'category', label: 'category', required: false },
      { key: 'is_active', label: 'active', required: false, type: 'boolean' },
    ],
    uniqueKey: 'quote',
  },
  emotional_tips: {
    table: 'emotional_tips',
    columns: [
      { key: 'title', label: 'title', required: true },
      { key: 'description', label: 'description', required: true },
      { key: 'emotion_type', label: 'emotion_type', required: false, allowedValues: ['ansiedad', 'autoestima', 'relajación', 'estrés', 'motivación', 'mindfulness', 'bienestar', 'respiración', 'general'] },
      { key: 'image_url', label: 'image_url', required: false },
      { key: 'is_active', label: 'active', required: false, type: 'boolean' },
    ],
    uniqueKey: 'title',
  },
  wellness_activities: {
    table: 'wellness_activities',
    columns: [
      { key: 'title', label: 'title', required: true },
      { key: 'content', label: 'content', required: true },
      { key: 'activity_type', label: 'activity_type', required: false, allowedValues: ['mindfulness', 'meditation', 'breathing', 'relaxation', 'exercise', 'other'] },
      { key: 'duration', label: 'duration', required: false, type: 'number' },
      { key: 'image_url', label: 'image_url', required: false },
      { key: 'is_active', label: 'active', required: false, type: 'boolean' },
    ],
    uniqueKey: 'title',
  },
  emotions: {
    table: 'emotions',
    columns: [
      { key: 'emotion_name', label: 'emotion_name', required: true },
      { key: 'description', label: 'description', required: false },
      { key: 'color', label: 'color', required: false },
      { key: 'icon', label: 'icon', required: false },
      { key: 'recommendation_title_1', label: 'recommendation_title_1', required: false },
      { key: 'recommendation_text_1', label: 'recommendation_text_1', required: false },
      { key: 'recommendation_title_2', label: 'recommendation_title_2', required: false },
      { key: 'recommendation_text_2', label: 'recommendation_text_2', required: false },
      { key: 'recommendation_title_3', label: 'recommendation_title_3', required: false },
      { key: 'recommendation_text_3', label: 'recommendation_text_3', required: false },
      { key: 'recommendation_title_4', label: 'recommendation_title_4', required: false },
      { key: 'recommendation_text_4', label: 'recommendation_text_4', required: false },
      { key: 'recommendation_title_5', label: 'recommendation_title_5', required: false },
      { key: 'recommendation_text_5', label: 'recommendation_text_5', required: false },
      { key: 'is_active', label: 'active', required: false, type: 'boolean' },
    ],
    uniqueKey: 'emotion_name',
  },
  mini_games: {
    table: 'mini_games',
    columns: [
      { key: 'title', label: 'title', required: true },
      { key: 'description', label: 'description', required: false },
      { key: 'game_type', label: 'game_type', required: false, allowedValues: ['affirmations', 'breathing', 'gratitude', 'trivia', 'memory', 'other'] },
      { key: 'difficulty', label: 'difficulty', required: false, allowedValues: ['facil', 'medio', 'dificil'] },
      { key: 'icon', label: 'icon', required: false },
      { key: 'route', label: 'route', required: false },
      { key: 'is_active', label: 'active', required: false, type: 'boolean' },
    ],
    uniqueKey: 'title',
  },
  eventos: {
    table: 'eventos',
    columns: [
      { key: 'titulo', label: 'titulo', required: true },
      { key: 'descripcion', label: 'descripcion', required: false },
      { key: 'fecha_inicio', label: 'fecha_inicio', required: false, type: 'date' },
      { key: 'fecha_fin', label: 'fecha_fin', required: false, type: 'date' },
      { key: 'ubicacion', label: 'ubicacion', required: false },
      { key: 'modalidad', label: 'modalidad', required: false, allowedValues: ['Presencial', 'Virtual', 'Híbrido'] },
      { key: 'estado', label: 'estado', required: false, allowedValues: ['publicado', 'borrador', 'cancelado', 'finalizado', 'pospuesto'] },
    ],
    uniqueKey: 'titulo',
  },
};

@Injectable({ providedIn: 'root' })
export class BulkImportService {
  private supabaseService = inject(SupabaseService);

  private get supabase() {
    return this.supabaseService.client;
  }

  getConfig(table: string): ImportTableConfig | null {
    return TABLE_CONFIGS[table] || null;
  }

  getAvailableTables(): string[] {
    return Object.keys(TABLE_CONFIGS);
  }

  downloadTemplate(table: string): void {
    const config = this.getConfig(table);
    if (!config) return;

    const headerRow = config.columns.map(c => c.label);
    const exampleRow = config.columns.map(c => {
      if (c.allowedValues) return c.allowedValues[0];
      if (c.type === 'boolean') return 'true';
      if (c.type === 'number') return '0';
      if (c.key === 'image_url') return 'https://example.com/image.jpg';
      if (c.key === 'duration') return '10';
      if (c.key === 'recommendation_title_1') return 'Respira';
      if (c.key === 'recommendation_text_1') return 'Inhala profundo y exhala lentamente 3 veces';
      if (c.key === 'recommendation_title_2') return 'Camina';
      if (c.key === 'recommendation_text_2') return 'Da una caminata corta para despejar la mente';
      if (c.key === 'recommendation_title_3') return 'Escribe';
      if (c.key === 'recommendation_text_3') return '3 cosas por las que estás agradecido hoy';
      if (c.key === 'recommendation_title_4') return '';
      if (c.key === 'recommendation_text_4') return '';
      if (c.key === 'recommendation_title_5') return '';
      if (c.key === 'recommendation_text_5') return '';
      if (c.key === 'route') return '/ruta-ejemplo';
      if (c.key === 'icon') return 'game-controller-outline';
      if (c.key === 'color') return '#627eff';
      return c.label === 'quote' ? 'Escribe aquí la frase...' :
             c.label === 'title' ? 'Título de ejemplo' :
             c.label === 'description' || c.label === 'content' ? 'Descripción de ejemplo' :
             c.label === 'descripcion' ? 'Descripción del evento' :
             c.label === 'author' ? 'Anónimo' :
             c.label === 'category' ? 'general' :
             c.label === 'emotion_type' ? 'general' :
             c.label === 'emotion_name' ? 'Alegría' :
             c.label === 'activity_type' ? 'mindfulness' :
             c.label === 'game_type' ? 'affirmations' :
             c.label === 'difficulty' ? 'facil' :
             c.label === 'titulo' ? 'Título del evento' :
             c.label === 'fecha_inicio' ? '2026-06-01T10:00:00Z' :
             c.label === 'fecha_fin' ? '2026-06-01T12:00:00Z' :
             c.label === 'ubicacion' ? 'Online' :
             c.label === 'modalidad' ? 'Virtual' :
             c.label === 'estado' ? 'publicado' : '';
    });

    const instructions = [
      ['INSTRUCCIONES'],
      [''],
      ['Columnas requeridas: ' + config.columns.filter(c => c.required).map(c => c.label).join(', ')],
      ...(config.columns.filter(c => c.allowedValues).map(c => [`Columna "${c.label}" valores permitidos: ${c.allowedValues!.join(', ')}`])),
      [''],
      ['No incluir: id, created_at, updated_at (se generan automáticamente)'],
      ['La primera fila son los encabezados (no modificarlos)'],
      ['La segunda fila es un ejemplo (reemplazar o eliminar)'],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headerRow, exampleRow]);
    const colWidths = config.columns.map(c => ({
      wch: Math.max(c.label.length + 4, 20),
    }));
    ws['!cols'] = colWidths;

    const instructionsWs = XLSX.utils.aoa_to_sheet(instructions);
    instructionsWs['!cols'] = [{ wch: 60 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instrucciones');
    XLSX.writeFile(wb, `${table}_template.xlsx`);
  }

  async exportToFile(table: string, records: any[]): Promise<void> {
    const config = this.getConfig(table);
    if (!config || records.length === 0) return;

    const headerRow = config.columns.map(c => c.label);
    const dataRows = records.map(record => {
      const expanded = { ...record };
      if (table === 'emotions' && Array.isArray(expanded.recommendations)) {
        for (let r = 1; r <= 5; r++) {
          const rec = expanded.recommendations[r - 1];
          expanded[`recommendation_title_${r}`] = rec?.title || '';
          expanded[`recommendation_text_${r}`] = rec?.text || '';
        }
        delete expanded.recommendations;
      }
      return config.columns.map(c => {
        const val = expanded[c.key];
        if (c.type === 'boolean') return val ? 'true' : 'false';
        return val !== null && val !== undefined ? String(val) : '';
      });
    });

    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
    const colWidths = config.columns.map(c => ({
      wch: Math.max(c.label.length + 4, 20),
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, table);
    XLSX.writeFile(wb, `${table}_export_${Date.now()}.xlsx`);
  }

  async importFromFile(file: File, table: string, skipDuplicates = true): Promise<ImportResult> {
    const config = this.getConfig(table);
    if (!config) {
      return { success: 0, errors: [{ row: 0, message: `Tabla "${table}" no soportada` }] };
    }

    const result: ImportResult = { success: 0, errors: [] };
    const data = await this.readFile(file);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rows.length === 0) {
      result.errors.push({ row: 0, message: 'El archivo está vacío' });
      return result;
    }

    let existingKeys: Set<string> = new Set();
    if (skipDuplicates && config.uniqueKey) {
      try {
        const { data: existing } = await this.supabase
          .from(config.table)
          .select(config.uniqueKey);
        if (existing) {
          existingKeys = new Set(existing.map((e: any) => String(e[config.uniqueKey!]).toLowerCase().trim()));
        }
      } catch { /* ignore */ }
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const record: Record<string, any> = {};
      let rowError: string | null = null;

      for (const col of config.columns) {
        const value = row[col.label] !== undefined ? row[col.label] : row[col.key];
        if (col.required && (value === '' || value === undefined || value === null)) {
          rowError = `Campo requerido "${col.label}" faltante`;
          break;
        }
        if (value !== '' && value !== undefined && value !== null) {
          if (col.type === 'boolean') {
            record[col.key] = value === true || value === 'true' || value === '1' || value === 1;
          } else if (col.type === 'number') {
            record[col.key] = Number(value);
          } else if (col.allowedValues && !col.allowedValues.includes(String(value))) {
            rowError = `Valor "${value}" no válido para "${col.label}". Permitidos: ${col.allowedValues.join(', ')}`;
            break;
          } else {
            record[col.key] = String(value);
          }
        } else {
          if (col.key === 'recommendations') {
            record[col.key] = '[]';
          } else {
            record[col.key] = null;
          }
        }
      }

      if (rowError) {
        result.errors.push({ row: i + 2, message: rowError });
        continue;
      }

      if (table === 'emotions') {
        const recs: { title: string; text: string }[] = [];
        for (let r = 1; r <= 5; r++) {
          const title = record[`recommendation_title_${r}`] || '';
          const text = record[`recommendation_text_${r}`] || '';
          if (title || text) {
            recs.push({ title: String(title), text: String(text) });
          }
          delete record[`recommendation_title_${r}`];
          delete record[`recommendation_text_${r}`];
        }
        record['recommendations'] = recs;
      }

      if (skipDuplicates && config.uniqueKey && record[config.uniqueKey]) {
        const key = String(record[config.uniqueKey]).toLowerCase().trim();
        if (existingKeys.has(key)) {
          result.errors.push({ row: i + 2, message: `Registro duplicado: ${config.uniqueKey}="${record[config.uniqueKey]}"` });
          continue;
        }
        existingKeys.add(key);
      }

      try {
        const { error } = await this.supabase.from(config.table).insert(record);
        if (error) {
          result.errors.push({ row: i + 2, message: error.message });
        } else {
          result.success++;
        }
      } catch (e: any) {
        result.errors.push({ row: i + 2, message: e.message || 'Error desconocido' });
      }
    }

    return result;
  }

  private readFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }
}
