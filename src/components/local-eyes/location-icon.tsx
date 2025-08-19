"use client";

import type { LocationCategory } from '@/lib/types';
import { Utensils, Bed, Hospital } from 'lucide-react';

interface LocationIconProps extends React.SVGProps<SVGSVGElement> {
  category: LocationCategory;
}

export function LocationIcon({ category, ...props }: LocationIconProps) {
  switch (category) {
    case 'restaurant':
      return <Utensils {...props} />;
    case 'hotel':
      return <Bed {...props} />;
    case 'hospital':
      return <Hospital {...props} />;
    default:
      return null;
  }
}
