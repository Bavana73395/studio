"use client";

import type { LocationCategory } from '@/lib/types';
import { Utensils, Bed, Hospital, Landmark, TreePine, ShoppingCart, School, BarChart, Train, Building, Globe } from 'lucide-react';

interface LocationIconProps extends React.SVGProps<SVGSVGElement> {
  category: LocationCategory;
}

export function LocationIcon({ category, ...props }: LocationIconProps) {
  const lowerCaseCategory = category.toLowerCase();
  
  if (lowerCaseCategory.includes('restaurant') || lowerCaseCategory.includes('food') || lowerCaseCategory.includes('cafe')) {
    return <Utensils {...props} />;
  }
  if (lowerCaseCategory.includes('hotel') || lowerCaseCategory.includes('lodging')) {
    return <Bed {...props} />;
  }
  if (lowerCaseCategory.includes('hospital') || lowerCaseCategory.includes('clinic') || lowerCaseCategory.includes('health')) {
    return <Hospital {...props} />;
  }
  if (lowerCaseCategory.includes('park') || lowerCaseCategory.includes('garden')) {
    return <TreePine {...props} />;
  }
  if (lowerCaseCategory.includes('store') || lowerCaseCategory.includes('shop') || lowerCaseCategory.includes('market')) {
    return <ShoppingCart {...props} />;
  }
   if (lowerCaseCategory.includes('landmark') || lowerCaseCategory.includes('monument')) {
    return <Landmark {...props} />;
  }
  if (lowerCaseCategory.includes('school') || lowerCaseCategory.includes('university') || lowerCaseCategory.includes('college')) {
    return <School {...props} />;
  }
  if (lowerCaseCategory.includes('bar') || lowerCaseCategory.includes('pub')) {
    return <BarChart {...props} />;
  }
  if (lowerCaseCategory.includes('station') || lowerCaseCategory.includes('transport')) {
    return <Train {...props} />;
  }
  if (lowerCaseCategory.includes('office') || lowerCaseCategory.includes('building')) {
    return <Building {...props} />;
  }
  
  return <Globe {...props} />;
}
