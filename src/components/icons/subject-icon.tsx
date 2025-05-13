import type * as React from 'react';
import { Book } from 'lucide-react'; // Default icon
import { SUBJECTS } from '@/lib/constants';
import type { Subject } from '@/lib/types';

interface SubjectIconProps extends React.SVGProps<SVGSVGElement> {
  subjectValue: string;
}

export function SubjectIcon({ subjectValue, className, ...props }: SubjectIconProps) {
  const subject = SUBJECTS.find((s) => s.value === subjectValue);
  const IconComponent = subject?.icon || Book;
  return <IconComponent className={className} {...props} />;
}
