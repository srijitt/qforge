import type { Board, ClassLevel, Subject } from '@/lib/types';
import { BookOpen, Calculator, FlaskConical, Globe, Landmark, PenTool, Atom, Dna, Sigma } from 'lucide-react'; // Added Atom, Dna, Sigma

export const BOARDS: Board[] = [
  { value: 'cbse', label: 'CBSE', icon: Landmark },
  { value: 'icse', label: 'ICSE', icon: Landmark },
  { value: 'west bengal', label: 'West Bengal State Board', icon: Landmark },
  // Add more state boards as needed
];

export const CLASS_LEVELS: ClassLevel[] = Array.from({ length: 12 }, (_, i) => ({
  value: `${i + 1}`,
  label: `Class ${i + 1}`,
}));

export const SUBJECTS: Subject[] = [
  { value: 'math', label: 'Mathematics', icon: Calculator },
  { value: 'science', label: 'Science', icon: Sigma },
  { value: 'physics', label: 'Physics', icon: Atom },
  { value: 'chemistry', label: 'Chemistry', icon: FlaskConical },
  { value: 'biology', label: 'Biology', icon: Dna },
  { value: 'social_studies', label: 'Social Studies', icon: Globe },
  { value: 'english', label: 'English', icon: PenTool },
  { value: 'history', label: 'History', icon: BookOpen },
  { value: 'geography', label: 'Geography', icon: Globe },
  // Add more subjects as needed
];

export const MARK_OPTIONS = [1, 2, 3, 4, 5, 10]; // Common mark values

