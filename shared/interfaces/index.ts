export interface AppointmentRequest {
  id?: string;
  user_name: string;
  email: string;
  phone?: string;
  requested_date?: string;
  requested_time?: string;
  message?: string;
  emotional_state?: string;
  consent?: boolean;
  status: 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'reagendada';
  created_at?: string;
  updated_at?: string;
  reagendada_date?: string;
}

export interface Quote {
  id: string;
  quote: string;
  author: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface EmotionalTip {
  id: string;
  title: string;
  description: string;
  emotion_type: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface WellnessActivity {
  id: string;
  title: string;
  content: string;
  activity_type: string;
  duration: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface MiniGame {
  id: string;
  title: string;
  description: string;
  game_type: string;
  difficulty: string;
  icon: string;
  route: string;
  is_active: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  eventos: boolean;
  consejos: boolean;
  frases: boolean;
  recordatorios: boolean;
  minijuegos: boolean;
}

export interface InternalNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  image_url: string;
  related_id: string;
  related_table: string;
  is_read: boolean;
  created_at: string;
}

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
  uniqueKey?: string;
}

export interface ImportResult {
  success: number;
  errors: { row: number; message: string }[];
}

export interface ProfileUpdate {
  nickname?: string;
  avatar?: string;
  emotional_points?: number;
  level?: number;
  streak?: number;
  preferences?: Record<string, any>;
}

export interface ProgressRecord {
  activity_id?: string;
  activity_type?: string;
  emotional_state?: string;
  score?: number;
  metadata?: Record<string, any>;
}

export interface EmotionalState {
  value: string;
  label: string;
  icon: string;
}

export interface WeekDay {
  label: string;
  date: Date;
}
