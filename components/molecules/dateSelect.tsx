import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { Button } from '../atoms/button';
import { Calendar } from '../atoms/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { FormLabel } from '../ui/form';

interface DateChooserProps {
  label: string;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  disableBeforeToday?: boolean;
}

export const DateChooser: React.FC<DateChooserProps> = ({ label, selectedDate, onDateChange, disableBeforeToday = true }) => {
  const today = new Date(new Date().toDateString());
  return (
    <div className="flex flex-col">
      <FormLabel className="mb-2">{label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => onDateChange(date || undefined)}
            disabled={(date) => disableBeforeToday && date < today}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
