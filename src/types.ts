export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface QuestionsData {
  [year: string]: Question[];
}

export interface PastAnswer {
  question: string;
  answer: string;
  isCorrect: boolean;
}
