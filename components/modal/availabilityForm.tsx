// components/modal/AvailabilityFormModal.tsx

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { FormItem, FormLabel, FormControl } from '../ui/form';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { RentalOptions, Location } from '@prisma/client';
import { getAvailableReservationOptions } from '@/actions/listAvailableRentalOptions';
import { listLocation } from '@/actions/listLocations';
import { calculateAvailability } from '@/actions/calculateAvailability';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const AvailabilitySchema = z.object({
  rentDate: z.date().nullable(),
  jetskiCount: z.number().min(1),
  rentalOption: z.any().optional(),
  location: z.any().optional(),
});

type AvailabilityFormValues = z.infer<typeof AvailabilitySchema>;

interface AvailabilityFormModalProps {
  onClose: () => void;
}

const AvailabilityFormModal: React.FC<AvailabilityFormModalProps> = ({ onClose }) => {
  const methods = useForm<AvailabilityFormValues>({
    resolver: zodResolver(AvailabilitySchema),
  });

  const { control, handleSubmit } = methods;

  const [rentalOptions, setRentalOptions] = useState<RentalOptions[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [includeLocation, setIncludeLocation] = useState(false);
  const [checkedAvailability, setCheckedAvailability] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const options = await getAvailableReservationOptions();
        if(options)
            setRentalOptions(options);

        const locationData = await listLocation();
        if(locationData)
            setLocations(locationData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleCheckAvailability = async (data: AvailabilityFormValues) => {
    if (data.rentDate && data.jetskiCount && data.rentalOption) {
      try {
        let slots;
        const timezoneOffset = data.rentDate.getTimezoneOffset();
        if (includeLocation && data.location)
        {
          slots = await calculateAvailability(data.rentDate.toDateString(), data.jetskiCount, data.rentalOption, data.location.location_id, timezoneOffset);
        }
        else{
          slots = await calculateAvailability(data.rentDate.toDateString(), data.jetskiCount, data.rentalOption, timezoneOffset);
        }
        setCheckedAvailability(true);
        setAvailableSlots(slots.slice(0,5));
      } catch (error) {
        console.error('Error checking availability:', error);
      }
    }
  };

  return (
    <Modal onClose={onClose}>
    <div className='text-center'>
        <strong>
            Check Availability        
        </strong>
    </div>
    <FormProvider {...methods}>
          <Controller
            name="rentDate"
            control={control}
            render={({ field }) => (
              <FormItem className='flex justify-between'>
                <FormLabel className='flex items-center font-bold'>Date:</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline">
                        {field.value ? field.value.toDateString() : 'Select a date'}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={(date) => field.onChange(date)}
                      disabled={(date) => date < new Date(new Date().toDateString()) 
                    }
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        <div>
            <Controller
                name="jetskiCount"
                control={control}
                render={({ field }) => (
                <FormItem className='flex justify-between gap-2'>
                    <FormLabel className='flex items-center font-bold'>Number of Jetskis:</FormLabel>
                    <FormControl>
                        <input
                            type="number"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            min={1}
                            className="input text-end"
                        />
                    </FormControl>
                </FormItem>
                )}
                />
        </div>
        <Controller
            name="rentalOption"
            control={control}
            render={({ field }) => (
              <FormItem className='flex justify-between gap-2'>
                <FormLabel className='flex items-center font-bold'>Rental Option: </FormLabel>
                <FormControl className='rounded-sm p-1'>
                  <select
                    value={field.value?.rentaloption_id || ''}
                    onChange={(e) => {
                      const selectedOption = rentalOptions.find(option => option.rentaloption_id === parseInt(e.target.value));
                      field.onChange(selectedOption);
                    }}
                    className='shadow-[1px_1px_3px_rgba(0,0,0,0.5)] bg-black text-white'>
                    <option value="">Select an option</option> 
                    {rentalOptions.map((option) => (
                      <option key={option.rentaloption_id} value={option.rentaloption_id}>
                        {option.rentaloption_description} rent / {option.duration} minutes
                      </option>
                    ))}
                  </select>
                </FormControl>
              </FormItem>
            )}
          />
          <form className="flex flex-col gap-1" onSubmit={handleSubmit(handleCheckAvailability)}>
            <div className="flex items-center">
              <label className='font-bold text-sm' htmlFor="includeLocation">Check availability per location</label>
              <input
                type="checkbox"
                checked={includeLocation}
                onChange={(e) => setIncludeLocation(e.target.checked)}
                id="includeLocation"
                className="ml-5 mr-2"
              />
            </div>
          {includeLocation && (
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <FormItem className="flex justify-between ">
                  <FormLabel className="flex items-center font-bold">Location: </FormLabel>
                  <FormControl className='rounded sm p-1'>
                    <select
                      value={field.value?.location_id || ''}
                      onChange={(e) => {
                        const selectedLocationId = parseInt(e.target.value);
                        if (selectedLocationId === 0) {
                          field.onChange(null);
                        } else {
                          const selectedLocation = locations.find(location => location.location_id === selectedLocationId);
                          field.onChange(selectedLocation);
                        }
                      }}
                      className='shadow-[1px_1px_3px_rgba(0,0,0,0.5)] bg-black text-white'>
                      <option value="0">All locations</option>
                      {locations.map((location) => (
                        <option key={location.location_id} value={location.location_id}>
                          {location.location_name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          <Button type="submit">Check Availability</Button>
        </form>
        {availableSlots.length > 0 && (
          <div className='flex flex-col items-center gap-4 mt-4'>
            <div className="availability-results p-4 bg-gray-100 rounded-md shadow-md w-full max-w-md">
              <h3 className="text-lg font-semibold mb-2">Available Slots</h3>
              <ul className="space-y-2">
                {availableSlots.map((slot, index) => (
                  <li key={index} className="p-2 bg-white rounded-md shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{slot.start_time} - {slot.end_time}</span>
                      <span className="text-sm text-gray-500">Available Jetskis: {slot.available_jetskis}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {availableSlots.length == 0 && checkedAvailability &&(
          <p>There are no available slots for selected options.</p>
        )}
        
      </FormProvider>
    </Modal>
  );
};

export default AvailabilityFormModal;
