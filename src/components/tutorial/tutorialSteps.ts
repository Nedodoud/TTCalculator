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
    text: "This bar resizes team composition frame, try pulling it."
  }
  ,{
    id: "recommendation-block",
    text: "Recommendations and warnings appear dynamically here."
  }
  ,{
    id: "recommendation-priority-buttons",
    text: "Recommendations can be viewed separately for each priority and for the entire project as a whole."
  }
  ,{
    id: "reset-buttons",
    text: "A button that resets all parameters and mechanics"
  }
  ,{
    id: "survey-button",
    text: "Please take a short survey after trying out features of the app! We would be very grateful for it!"
  }
  
];