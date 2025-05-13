import type * as React from 'react';
import { Landmark } from 'lucide-react'; // Default icon
import { BOARDS } from '@/lib/constants';
import type { Board } from '@/lib/types';

interface BoardIconProps extends React.SVGProps<SVGSVGElement> {
  boardValue: string;
}

export function BoardIcon({ boardValue, className, ...props }: BoardIconProps) {
  const board = BOARDS.find((b) => b.value === boardValue);
  const IconComponent = board?.icon || Landmark;
  return <IconComponent className={className} {...props} />;
}
