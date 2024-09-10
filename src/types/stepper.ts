export interface Response {
  id: string;
  code: string;
  name: string;
  score: number;
  options: Option[];
}

export interface Option {
  id: string;
  code: string;
  name: string;
  score: number;
}
export interface Question {
  id: string;
  code: string;
  name: string;
  responses: Response[];
}

export interface SubStep {
  id: string;
  code: string;
  name: string;
  isCompleted: boolean;
  questions: Question[];  // Add this to reflect the structure
}

export interface Step {
  id: string;
  code: string;
  name: string;
  isCompleted: boolean;
  subSteps: SubStep[];
}
