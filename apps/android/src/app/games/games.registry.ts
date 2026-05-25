export interface GameDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  gameType: string;
  difficulty: 'facil' | 'medio' | 'dificil';
  route: string;
  component: () => Promise<any>;
  color: string;
}

export const GAMES_REGISTRY: GameDefinition[] = [
  {
    id: 'memory',
    title: 'Memoria Emocional',
    description: 'Encuentra los pares de emociones ocultas. Ejercita tu memoria mientras conectas con tus sentimientos.',
    icon: 'grid-outline',
    gameType: 'memoria',
    difficulty: 'medio',
    route: '/minijuegos/memory',
    component: () => import('./memory-game.component'),
    color: '#627eff',
  },
  {
    id: 'respiracion',
    title: 'Respiración Guiada',
    description: 'Sigue el ritmo de la animación para calmar tu mente con una respiración profunda.',
    icon: 'water-outline',
    gameType: 'respiracion',
    difficulty: 'facil',
    route: '/minijuegos/respiracion',
    component: () => import('./breathing-game.component'),
    color: '#22c55e',
  },
  {
    id: 'gratitud',
    title: 'Diario de Gratitud',
    description: 'Escribe tres cosas por las que estás agradecido hoy. Cultivar la gratitud mejora tu bienestar.',
    icon: 'heart-outline',
    gameType: 'gratitud',
    difficulty: 'facil',
    route: '/minijuegos/gratitud',
    component: () => import('./gratitude-game.component'),
    color: '#ec4899',
  },
  {
    id: 'sopa',
    title: 'Sopa de Letras',
    description: 'Encuentra palabras relacionadas con el bienestar emocional en esta sopa de letras.',
    icon: 'search-outline',
    gameType: 'sopa',
    difficulty: 'medio',
    route: '/minijuegos/sopa',
    component: () => import('./wordsearch-game.component'),
    color: '#f59e0b',
  },
  {
    id: 'puzzle',
    title: 'Rompecabezas',
    description: 'Arma la imagen motivacional moviendo las piezas a su lugar correcto.',
    icon: 'image-outline',
    gameType: 'puzzle',
    difficulty: 'dificil',
    route: '/minijuegos/puzzle',
    component: () => import('./puzzle-game.component'),
    color: '#8b5cf6',
  },
  {
    id: 'colorear',
    title: 'Colorear',
    description: 'Colorea mandalas y dibujos terapéuticos para relajar tu mente.',
    icon: 'color-palette-outline',
    gameType: 'colorear',
    difficulty: 'facil',
    route: '/minijuegos/colorear',
    component: () => import('./coloring-game.component'),
    color: '#10b981',
  },
  {
    id: 'reflejos',
    title: 'Reflejos',
    description: 'Toca los círculos de colores lo más rápido que puedas. Mejora tu concentración.',
    icon: 'flash-outline',
    gameType: 'reflejos',
    difficulty: 'medio',
    route: '/minijuegos/reflejos',
    component: () => import('./reaction-game.component'),
    color: '#ef4444',
  },
  {
    id: 'calma',
    title: 'Cuenta Calma',
    description: 'Concéntrate en contar objetos mientras tu mente se relaja.',
    icon: 'calculator-outline',
    gameType: 'calma',
    difficulty: 'facil',
    route: '/minijuegos/calma',
    component: () => import('./calm-count-game.component'),
    color: '#3b82f6',
  },
  {
    id: 'afirmaciones',
    title: 'Afirmaciones',
    description: 'Selecciona las afirmaciones positivas que más resuenen contigo hoy.',
    icon: 'chatbubbles-outline',
    gameType: 'afirmaciones',
    difficulty: 'facil',
    route: '/minijuegos/afirmaciones',
    component: () => import('./affirmations-game.component'),
    color: '#6366f1',
  },
  {
    id: 'emocion',
    title: '¿Qué Emoción es?',
    description: 'Adivina la emoción según su descripción. Aprende a identificar tus emociones.',
    icon: 'happy-outline',
    gameType: 'emocion',
    difficulty: 'medio',
    route: '/minijuegos/emocion',
    component: () => import('./emotion-quiz-game.component'),
    color: '#627eff',
  },
];

export function getGameById(id: string): GameDefinition | undefined {
  return GAMES_REGISTRY.find(g => g.id === id);
}

export function getGamesByDifficulty(difficulty: string): GameDefinition[] {
  return GAMES_REGISTRY.filter(g => g.difficulty === difficulty);
}

export function getGamesByType(gameType: string): GameDefinition[] {
  return GAMES_REGISTRY.filter(g => g.gameType === gameType);
}
