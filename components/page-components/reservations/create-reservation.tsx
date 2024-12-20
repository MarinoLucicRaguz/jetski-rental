'use client';

import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useTransition } from 'react';
import { JetskiReservationSchema } from '@/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CardWrapper } from '@/components/auth/card-wrapper';
import { Button } from '../../atoms/button';
import { format, add } from 'date-fns';
import { Calendar } from '../../atoms/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Jetski, Location, RentalOption } from '@prisma/client';
import { createReservation } from '@/actions/reservationActions/createReservation';
import { listAvailableJetskis } from '@/actions/listAvailableJetskis';
import { GetLocations } from '@/actions/getAllLocations';
import { FormError } from '../../form-error';
import { FormSuccess } from '../../form-success';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { GetActiveRentalOptions } from '@/actions/listAvailableRentalOptions';
import { PhoneInput } from 'react-international-phone';
import { Input } from '../../atoms/input';
import { debounce } from 'lodash';
import 'react-international-phone/style.css';
import { DateTime } from 'luxon';
import { DateChooser } from '@/components/molecules/dateSelect';
import { Select } from '@/components/atoms/select';

export const JetSkiReservationForm = () => {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();
  const [rentalOptions, setRentalOptions] = useState<RentalOption[] | null>([]);
  const [selectedRentalOption, setRentalOption] = useState<RentalOption>();
  const [phone, setPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [rentDate, setRentDate] = useState<Date>();
  const [startTime, setStartTime] = useState<Date>();
  const [endTime, setEndTime] = useState<Date>();
  const [availableJetskis, setAvailableJetskis] = useState<Jetski[]>([]);
  const [selectedJetski, setSelectedJetski] = useState<Jetski[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location>();

  const form = useForm<z.infer<typeof JetskiReservationSchema>>({
    resolver: zodResolver(JetskiReservationSchema),
    defaultValues: {
      rentDate: rentDate,
      startTime: startTime,
      endTime: endTime,
      locationId: selectedLocation?.id,
      jetskis: selectedJetski,
      contactNumber: phone,
      totalPrice: totalPrice,
      rentalOptionId: selectedRentalOption?.id,
      discount: discount,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rentalData, locationData] = await Promise.all([GetActiveRentalOptions(), GetLocations()]);
        setRentalOptions(rentalData);
        if (locationData) setLocations(locationData);
      } catch (error) {
        setError('Greška prilikom dohvaćanja podataka.');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    form.setValue('jetskis', selectedJetski);
  }, [selectedJetski, form]);

  useEffect(() => {
    if (rentDate && startTime) {
      const adjustedStartTime = new Date(
        rentDate.getFullYear(),
        rentDate.getMonth(),
        rentDate.getDate(),
        startTime.getHours(),
        startTime.getMinutes()
      );
      setStartTime(adjustedStartTime);
      updateEndTime(adjustedStartTime);
    }
  }, [rentDate, form]);

  useEffect(() => {
    if (startTime && selectedRentalOption) {
      const endTimeDate = add(startTime, {
        minutes: selectedRentalOption.duration,
      });
      setEndTime(endTimeDate);
      form.setValue('endTime', endTimeDate);
    }
  }, [startTime, selectedRentalOption]);

  useEffect(() => {
    const fetchJetskis = async () => {
      if (startTime && selectedRentalOption && endTime) {
        try {
          const data = await listAvailableJetskis(startTime, endTime);
          setAvailableJetskis(data);
        } catch (error) {
          setError('Error fetching jetskis');
        }
      }
    };

    fetchJetskis();
  }, [startTime, selectedRentalOption, endTime]);

  useEffect(() => {
    form.setValue('discount', discount);
  }, [discount]);

  useEffect(() => {
    let jetskiAmplifier = selectedRentalOption?.description === 'SAFARI' ? selectedJetski.length - 1 : selectedJetski.length;

    if (jetskiAmplifier <= 0) {
      jetskiAmplifier = 1;
    }

    if (selectedRentalOption) {
      const basePrice = selectedRentalOption.price * jetskiAmplifier;
      setTotalPrice(basePrice);
      form.setValue('totalPrice', basePrice);
    }
  }, [selectedRentalOption, selectedJetski]);

  const debounceTimeChange = debounce((handler, value) => handler(value), 300);

  const handleRentDateTimeChange = (selectedRentDate: Date) => {
    setRentDate(selectedRentDate);
    if (startTime) {
      const updatedStartTime = new Date(
        selectedRentDate.getFullYear(),
        selectedRentDate.getMonth(),
        selectedRentDate.getDate(),
        startTime.getHours(),
        startTime.getMinutes()
      );
      debounceTimeChange(setStartTime, updatedStartTime);
      debounceTimeChange(updateEndTime, updatedStartTime);
    }
  };

  const handleStartTimeChange = (selectedTime: Date | null) => {
    if (rentDate && selectedTime && !isNaN(selectedTime.getTime())) {
      const updatedStartTime = new Date(
        rentDate.getFullYear(),
        rentDate.getMonth(),
        rentDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      console.log(updatedStartTime);
      setStartTime(updatedStartTime);
      updateEndTime(updatedStartTime);
    } else {
      console.log('Rent date is not set or invalid time. Please select the rent date first.');
    }
  };

  const handleCheckboxChange = (jetski: Jetski, isChecked: boolean) => {
    setSelectedJetski((prevSelectedJetski) => (isChecked ? [...prevSelectedJetski, jetski] : prevSelectedJetski.filter((j) => j.id !== jetski.id)));
  };

  const updateEndTime = (startDateTime: Date) => {
    if (selectedRentalOption) {
      const endTimeDate = add(startDateTime, {
        minutes: selectedRentalOption.duration,
      });
      setEndTime(endTimeDate);
      form.setValue('endTime', endTimeDate);
    }
  };

  const onSubmit = async (values: z.infer<typeof JetskiReservationSchema>) => {
    console.log('Form submitted with values:', values);
    const updatedRentDate = DateTime.fromJSDate(values.rentDate).plus({ hours: 3 }).toJSDate();

    values.rentDate = updatedRentDate;
    console.log('Updated values with modified rentDate:', values);
    setError('');
    setSuccess('');

    startTransition(async () => {
      try {
        const data = await createReservation(values);
        console.log('Response from createReservation:', data);
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess(data.success);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } catch (error) {
        setError('An error occurred while submitting the form.');
        console.error(error);
      }
    });
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <CardWrapper headerLabel="Nova rezervacija" className="shadow-md xs:w-[350px] sm:w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
            <FormField
              control={form.control}
              name="rentDate"
              render={({ field }) => (
                <FormItem>
                  <DateChooser
                    label="Datum rezervacije"
                    selectedDate={field.value}
                    onDateChange={(date) => {
                      field.onChange(date);
                      if (date) handleRentDateTimeChange(date);
                    }}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Time of reservation</FormLabel>
                  <TimePicker
                    label="Select a time"
                    minTime={new Date(new Date().setHours(9, 0))}
                    maxTime={new Date(new Date().setHours(19, 30))}
                    skipDisabled={true}
                    value={startTime || null}
                    onChange={(newValue) => {
                      if (newValue) {
                        field.onChange(newValue);
                        handleStartTimeChange(newValue);
                      }
                    }}
                    views={['hours', 'minutes']}
                    ampm={false}
                    disabled={!rentDate}
                  />
                </FormItem>
              )}
            />
            <div>
              <input type="hidden" {...form.register('startTime')} value={startTime instanceof Date ? startTime.toISOString() : ''} />
            </div>
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="border-solid sans-serif text-bold">Lokacija rezervacije:</FormLabel>
                  <FormControl className="w-full rounded-md border border-input bg-transparent p-2 text-sm shadow-sm">
                    <Select
                      {...field}
                      allowUndefined={false}
                      value={Number(field.value)}
                      disabled={isPending}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      options={locations.map((location) => ({
                        id: location.id,
                        label: location.name,
                      }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="justify-between flex">
              <strong>Rental option: </strong>
              <FormControl className="w-80 bg-black text-white rounded-sm text-center border-solid p-1">
                <select
                  value={selectedRentalOption?.id || ''}
                  onChange={(event) => {
                    const selectedId = parseInt(event.target.value);
                    const selectedOption = rentalOptions?.find((option) => option.id === selectedId);
                    setRentalOption(selectedOption || undefined);
                    form.setValue('rentaloption_id', selectedId);
                  }}
                  disabled={!rentDate}
                >
                  <option value="">Select a rental option!</option>
                  {rentalOptions?.map((option) => (
                    <option key={option.id} value={option.id.toString()}>
                      {option.description} - {option.duration} minutes - {option.price} €
                    </option>
                  ))}
                </select>
              </FormControl>
            </div>
            <input type="hidden" {...form.register('rentaloption_id')} value={selectedRentalOption?.id} />
            <div className="flex justify-between">
              <strong>Reservation until:</strong>
              {endTime instanceof Date && <span className="bg-black text-white w-40 text-center">{format(endTime, 'HH:mm')}</span>}
              <input type="hidden" {...form.register('endTime')} value={endTime instanceof Date ? endTime.toISOString() : ''} />
            </div>
            <div>
              <strong>Choose jetskis:</strong>
              <FormControl className="rounded-sm border-solid p-1 flex-col justify-between">
                <div>
                  {availableJetskis.map((jetski) => (
                    <div key={jetski.id} className="block">
                      <label
                        style={{
                          fontWeight: 'bold',
                          fontFamily: 'TimesNewRoman',
                        }}
                      >
                        <input type="checkbox" onChange={(e) => handleCheckboxChange(jetski, e.target.checked)} />
                        {' ' + jetski.registration + ' - ' + (locations?.find((loc) => loc.id === jetski.locationId)?.name || 'No location')}
                      </label>
                    </div>
                  ))}
                </div>
              </FormControl>
            </div>
            <input type="hidden" {...form.register('reservation_jetski_list')} value={JSON.stringify(selectedJetski)} />
            <div>
              <FormField
                control={form.control}
                name="reservationOwner"
                render={({ field }) => (
                  <FormItem>
                    <strong>Reservation owner</strong>
                    <FormControl>
                      <Input {...field} disabled={isPending} placeholder="Owner of reservation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-xol justify-between ">
              <strong> Contact number: </strong>
              <Controller
                control={form.control}
                name="contactNumber"
                render={({ field, fieldState: { error } }) => (
                  <div className="w-full">
                    <PhoneInput
                      {...field}
                      defaultCountry="hr"
                      autoFocus={true}
                      onChange={(value) => {
                        setPhone(value);
                        field.onChange(value);
                      }}
                      value={phone}
                      className={error ? 'border-red-500' : ''}
                    />
                    {error && <span className="text-red-500">{error.message}</span>}
                  </div>
                )}
              />
            </div>
            <input type="hidden" {...form.register('contactNumber')} value={phone} />
            <div className="flex justify-between">
              <strong>Discount:</strong>
              <FormControl className="w-20 bg-black text-white rounded-sm text-center border-solid p-1">
                <select value={discount} onChange={(e) => setDiscount(parseInt(e.target.value))} className="form-control">
                  {[0, 5, 10, 15, 20].map((value) => (
                    <option key={value} value={value}>
                      {value}%
                    </option>
                  ))}
                </select>
              </FormControl>
            </div>
            <input type="hidden" {...form.register('discount')} value={discount} />
            <div className="flex justify-between">
              <strong>Total Price:</strong>
              <span>{(totalPrice * (1 - discount / 100)).toFixed(2)} €</span>
            </div>
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button type="submit" className="w-full">
              Confirm the reservation!
            </Button>
          </form>
        </Form>
      </CardWrapper>
    </LocalizationProvider>
  );
};
