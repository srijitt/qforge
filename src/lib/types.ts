import type { ComponentType } from 'react';

export interface Question {
  id: string;
  text: string;
  marks: number;
  topic: string;
  source?: string; // e.g., "PYQ - CBSE 2022" or "AI Generated"
}

export interface PaperSettings {
  board: string;
  classLevel: string;
  subject: string;
  topics: string[]; // List of chapters/topics
  syllabusInputType: 'text' | 'pdf';
  syllabusText?: string;
  syllabusFile?: any; // For file upload
  totalMarks: number;
  timeDuration: number; // in minutes
  markDistribution?: {
    [markValue: string]: number; // e.g., { "1": 5, "2": 10, "5": 3 } -> 5 one-mark, 10 two-mark, 3 five-mark questions
  };
  instructions?: string;
  header?: string; // School/Teacher Name
  includePYQs: boolean;
  generateProbables: boolean;
}

export interface FormattedSection {
    title: string;
    questions: Question[];
}

export interface GeneratedPaper {
  settings: PaperSettings;
  questions: Question[]; // The selected and assigned questions
  sections: FormattedSection[]; // Sections formatted for preview
}

export type Board = {
  value: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
};

export type ClassLevel = {
  value: string;
  label: string;
};

export type Subject = {
  value: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
};

// Type alias for form values, ensuring consistency
export type PaperSettingsFormValues = PaperSettings;
