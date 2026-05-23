export interface TutorialStep {
  id: string;
  text: string;
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: "team-size-slider",
    text: "Set the total number of people available in the team."
  }
  ,{
    id: "team-roles",
    text: "Distribute people between roles using these controls."
  }
  ,{
    id: "task-card-list",
    text: "Each card is a separate mechanic."
  }
  ,{
    id: "team-resize-hangle",
    text: "This part is movable, try pulling it."
  }
  ,{
    id: "recommendation-block",
    text: "Recommendations and warnings appear dynamically here."
  }
  ,{
    id: "recommendation-priority-buttons",
    text: "Recommendations can be viewed separately for each priority and for the entire project as a whole."
  },{
    id: "reset-buttons",
    text: "A button that resets all parameters and mechanics"
  }
  
];