import type { TaskTypeConfig } from "../types";

export const TASK_TYPES: Record<string, TaskTypeConfig> = {
  "Own mechanics": {
    name: "Own mechanicsт",
    complexity: -1,
    tags: {}
  },

  "Movement system": {
    name: "Movement system",
    complexity: 14,
    tags: {
      Engineer: { value: 2, weight: 0.6 },
      Art: { value: 2, weight: 0.4 }
    }
  },

  "Dialog system": {
    name: "Dialog system",
    complexity: 21,
    tags: {
      Engineer: { value: 1, weight: 0.2 },
      Art: { value: 3, weight: 0.8 }
    }
  },
  "Enemy behavior": {
    name: "Enemy behavior",
    complexity: 30,
    tags: {
      Engineer: { value: 2, weight: 0.8 },
      Art: { value: 2, weight: 0.5}
    }
  },
  "Narrative progression system": {
    name: "Narrative progression system",
    complexity: 40,
    tags: {
      Engineer: { value: 2, weight: 0.2 },
      Art: { value: 2, weight: 0.6 },
      Writer: { value: 2, weight: 1 }
    }
  },
  "Battle & Combo system": {
    name: "Battle & Combo system",
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
  "In-run Upgrates system": {
    name: "In-run Upgrates system",
    complexity: 28,
    tags: {
      Engineer: { value: 1, weight: 0.8 },
      Art: { value: 2, weight: 0.5 },
      Gamedesigner: { value: 1, weight: 0.9 }
    }
  },
  "Meta Gameplay": {
    name: "Meta Gameplay",
    complexity: 30,
    tags: {
      Engineer: { value: 1, weight: 0.7 },
      Art: { value: 3, weight: 0.3 },
      Gamedesigner: { value: 1, weight: 0.7 }
    }
  }
};