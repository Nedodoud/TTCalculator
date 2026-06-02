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
      "Разработчик": { value: 2, weight: 0.6 },
      "Художник": { value: 2, weight: 0.4 }
    }
  },

  "Система диалогов": {
    name: "Система диалогов",
    complexity: 21,
    tags: {
      "Разработчик": { value: 1, weight: 0.2 },
      "Художник": { value: 3, weight: 0.8 }
    }
  },
  "Поведение врагов": {
    name: "Поведение врагов",
    complexity: 30,
    tags: {
      "Разработчик": { value: 2, weight: 0.8 },
      "Художник": { value: 2, weight: 0.5}
    }
  },
  "Система нарративного прогресса": {
    name: "Система нарративного прогресса",
    complexity: 40,
    tags: {
      "Разработчик": { value: 2, weight: 0.2 },
      "Художник": { value: 2, weight: 0.6 },
      "Сценарист": { value: 2, weight: 1 }
    }
  },
  "Бой и Система комбо": {
    name: "Бой и Система комбо",
    complexity: 30,
    tags: {
      "Разработчик": { value: 2, weight: 0.7 },
      "Художник": { value: 2, weight: 0.6 },
      "Геймдизайнер": { value: 1, weight: 0.8 }
    }
  },
  "HUD & Menus": {
    name: "HUD & Menus",
    complexity: 21,
    tags: {
      "Разработчик": { value: 1, weight: 0.3 },
      "Художник": { value: 2, weight: 0.7 }
    }
  },
  "PCG": {
    name: "PCG",
    complexity: 90,
    tags: {
      "Разработчик": { value: 2, weight: 1 },
      "Художник": { value: 2, weight: 0.6 },
      "Музыкант": { value: 1, weight: 0.6 }
    }
  },
  "Система улучшений во время игрового процесса": {
    name: "Система улучшений во время игрового процесса",
    complexity: 28,
    tags: {
      "Разработчик": { value: 1, weight: 0.8 },
      "Художник": { value: 2, weight: 0.5 },
      "Геймдизайнер": { value: 1, weight: 0.9 }
    }
  },
  "Мета гейплей": {
    name: "Мета гейплей",
    complexity: 30,
    tags: {
      "Разработчик": { value: 1, weight: 0.7 },
      "Художник": { value: 3, weight: 0.3 },
      "Геймдизайнер": { value: 1, weight: 0.7 }
    }
  }
};