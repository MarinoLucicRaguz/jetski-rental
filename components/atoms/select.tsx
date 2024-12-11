import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { id: number | string; label: string }[];
  name: string;
  value: number | string | null;
  allowUndefined: boolean;
  undefinedText?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, options, value, allowUndefined, undefinedText, ...props }, ref) => {
  return (
    <div>
      <select className={cn(className)} ref={ref} {...props} value={value ?? (allowUndefined ? undefined : 0)}>
        {!allowUndefined ? (
          <option value={0} hidden>
            Odaberite opciju
          </option>
        ) : (
          <option defaultValue={undefined}>{undefinedText}</option>
        )}
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
