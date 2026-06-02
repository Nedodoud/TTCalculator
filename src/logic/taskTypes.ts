import type { TaskTypeConfig } from "../types";

export const TASK_TYPES: Record<string, TaskTypeConfig> = {
  "Своя механика": {
    name: "Своя механика",
    complexity: -1,
    tags: {}
  },

  "Система передвижения": {
    name: "Система передвижения",
    complexity: 14,
    tags: {
      Engineer: { value: 2, weight: 0.6 },
      Art: { value: 2, weight: 0.4 }
    }
  },

  "Система диалогов": {
    name: "Система диалогов",
    complexity: 21,
    tags: {
      Engineer: { value: 1, weight: 0.2 },
      Art: { value: 3, weight: 0.8 }
    }
  },
  "Поведение врагов": {
    name: "Поведение врагов",
    complexity: 30,
    tags: {
      Engineer: { value: 2, weight: 0.8 },
      Art: { value: 2, weight: 0.5}
    }
  },
  "Система нарративного прогресса": {
    name: "Система нарративного прогресса",
    complexity: 40,
    tags: {
      Engineer: { value: 2, weight: 0.2 },
      Art: { value: 2, weight: 0.6 },
      Writer: { value: 2, weight: 1 }
    }
  },
  "Бой и Система комбо": {
    name: "Бой и Система комбо",
    complexity: 30,
    tags: {
      Engineer: { value: 2, weight: 0.7 },
      Art: { value: 2, weight: 0.6 },
      Gamedesigner: { value: 1, weight: 0.8 }
    }
  },
  "HUD & Menus": {
    name: "HUD & Menus",
    complexity: 21,
    tags: {
      Engineer: { value: 1, weight: 0.3 },
      Art: { value: 2, weight: 0.7 }
    }
  },
  "PCG": {
    name: "PCG",
    complexity: 90,
    tags: {
      Engineer: { value: 2, weight: 1 },
      Art: { value: 2, weight: 0.6 },
      Music: { value: 1, weight: 0.6 }
    }
  },
  "Система улучшений во время игрового процесса": {
    name: "Система улучшений во время игрового процесса",
    complexity: 28,
    tags: {
      Engineer: { value: 1, weight: 0.8 },
      Art: { value: 2, weight: 0.5 },
      Gamedesigner: { value: 1, weight: 0.9 }
    }
  },
  "Мета гейплей": {
    name: "Мета гейплей",
    complexity: 30,
    tags: {
      Engineer: { value: 1, weight: 0.7 },
      Art: { value: 3, weight: 0.3 },
      Gamedesigner: { value: 1, weight: 0.7 }
    }
  }
};