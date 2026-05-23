import { Injectable, inject } from '@angular/core';
import * as XLSX from 'xlsx';
import { SupabaseService } from './supabase.service';

export interface ImportColumn {
  key: string;
  label: string;
  required: boolean;
  type?: 'text' | 'number' | 'boolean' | 'date';
  allowedValues?: string[];
}

export interface ImportTableConfig {
  table: string;
  columns: ImportColumn[];
}

export interface ImportResult {
  success: number;
  errors: { row: number; message: string }[];
}

const TABLE_CONFIGS: Record<string, ImportTableConfig> = {
  motivational_quotes: {
    table: 'motivational_quotes',
    columns: [
      { key: 'quote', label: 'quote', required: true },
      { key: 'author', label: 'author', required: false },
      { key: 'category', label: 'category', required: false },
      { key: 'is_active', label: 'active', required: false, type: 'boolean' },
    ],
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
      return c.label === 'quote' ? 'Escribe aquí la frase...' :
             c.label === 'title' ? 'Título de ejemplo' :
             c.label === 'description' || c.label === 'content' ? 'Descripción de ejemplo' :
             c.label === 'author' ? 'Anónimo' :
             c.label === 'category' ? 'general' :
             c.label === 'emotion_type' ? 'general' :
             c.label === 'activity_type' ? 'mindfulness' : '';
    });

    const ws = XLSX.utils.aoa_to_sheet([headerRow, exampleRow]);
    const colWidths = config.columns.map(c => ({
      wch: Math.max(c.label.length + 4, 20),
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, table);
    XLSX.writeFile(wb, `${table}_template.xlsx`);
  }

  async importFromFile(file: File, table: string): Promise<ImportResult> {
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
          record[col.key] = null;
        }
      }

      if (rowError) {
        result.errors.push({ row: i + 2, message: rowError });
        continue;
      }

      try {
        const { error } = await this.supabase.from(table).insert(record);
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
