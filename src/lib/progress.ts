export interface ProgressLesson {
  id: string;
  archived_at: string | null;
}

export interface ProgressSummary {
  watched: number;
  total: number;
  percent: number;
  completed: boolean;
}

/**
 * Porcentaje de avance (FR-011). Las clases archivadas no cuentan (FR-025);
 * un curso sin clases activas nunca se considera completado.
 */
export function computeProgress(lessons: ProgressLesson[], watchedIds: Set<string>): ProgressSummary {
  const active = lessons.filter((l) => l.archived_at === null);
  const watched = active.filter((l) => watchedIds.has(l.id)).length;
  const total = active.length;
  const percent = total === 0 ? 0 : Math.round((watched / total) * 100);
  return { watched, total, percent, completed: total > 0 && watched === total };
}
