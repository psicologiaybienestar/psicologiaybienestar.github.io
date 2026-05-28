export const UUID_KEY = 'pb_user_uuid';
export const TOKEN_KEY = 'pb_fcm_token';
export const PREFS_KEY = 'pb_notification_prefs';

export const DEFAULT_NOTIFICATION_PREFS = {
  eventos: true,
  consejos: true,
  frases: true,
  recordatorios: true,
  minijuegos: true,
};

export const WHATSAPP_DEFAULT_PHONE = '573164603881';
export const WHATSAPP_BASE_URL = 'https://wa.me/';

export const EMOTION_TYPES: string[] = ['general', 'ansiedad', 'autoestima', 'relajación', 'estrés', 'motivación', 'mindfulness', 'bienestar', 'respiración'];

export const EMOTIONAL_STATES = [
  { value: '', label: 'Seleccionar...', icon: '🤍' },
  { value: 'feliz', label: 'Feliz', icon: '😊' },
  { value: 'tranquilo', label: 'Tranquilo/a', icon: '😌' },
  { value: 'neutral', label: 'Neutral', icon: '😐' },
  { value: 'ansioso', label: 'Ansioso/a', icon: '😰' },
  { value: 'triste', label: 'Triste', icon: '😢' },
  { value: 'estresado', label: 'Estresado/a', icon: '😤' },
  { value: 'enojado', label: 'Enojado/a', icon: '😠' },
  { value: 'cansado', label: 'Cansado/a', icon: '😴' },
  { value: 'motivado', label: 'Motivado/a', icon: '💪' },
];

export const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export const CONTENT_TABLES = ['eventos', 'noticias', 'motivational_quotes', 'emotional_tips', 'mini_games', 'wellness_activities', 'emotions'];

export const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
