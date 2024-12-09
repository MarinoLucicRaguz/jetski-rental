import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { id: number; label: string }[];
  name: string;
  value: number;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, options, value, ...props }, ref) => {
  return (
    <div>
      <select className={cn(className)} ref={ref} {...props} value={value}>
        <option disabled hidden value={0}>
          Odaberite opciju
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});

Select.displayName = 'Select';

export { Select };
