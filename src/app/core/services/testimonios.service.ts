import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TestimoniosService {
  constructor(private http: HttpClient) {}

  getTestimonios(): Observable<any[]> {
    return this.http.get(environment.googleSheetsUrl, { responseType: 'text' }).pipe(
      map((csv) => this.parseCsv(csv))
    );
  }

  private parseCsv(csv: string): any[] {
    const lines = csv.split('\n').filter((l) => l.trim());
    if (lines.length === 0) return [];

    const headers = this.parseCsvLine(lines[0]);
    const result: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      if (values.length < 2) continue;

      const entry: any = {};
      headers.forEach((h, idx) => {
        const key = h.toLowerCase().replace(/\s+/g, '_');
        entry[key] = values[idx] || '';
      });

      result.push({
        nombre: entry['nombre_completo'] || entry[headers[0]] || '',
        comentario: entry['tu_testimonio'] || entry[headers[1]] || '',
        calificacion: entry['calificacion'] || '',
        fecha: this.formatDate(entry['fecha'] || ''),
      });
    }

    return result;
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map((s) => s.replace(/^"|"$/g, ''));
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const fullYear = year.length === 2 ? '20' + year : year;
      return `${day}/${month}/${fullYear}`;
    }
    return dateStr;
  }
}
