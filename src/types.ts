export interface TaskTypeConfig {
  name: string;
  complexity: number;
  tags: Record<string, Record<string, number>>; // tag → значение
}

export interface Card {
  id: number;
  title: string;
  core: boolean;
  planned: boolean;
  tags: string[];
  tagValues: Record<string, number>;
  recommendedTagValues: Record<string, number>;
  complexity: number;
  recommendedComplexity: number;

  priority: number; // 👈 новое
  taskType: string; // 👈 новое
}