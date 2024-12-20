'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { ReservationOptionSchema } from '@/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CardWrapper } from '@/components/auth/card-wrapper';
import { createReservationOption } from '@/actions/rentaloptionActions/createReservationOption';
import { Input } from '@/components/atoms/input';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { Button } from '@/components/atoms/button';
import { Select } from '@/components/atoms/select';
import { RentalOptionType } from '@prisma/client';

const rentalOptionTypes = Object.values(RentalOptionType);

export const ReservationOptionForm = () => {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ReservationOptionSchema>>({
    resolver: zodResolver(ReservationOptionSchema),
    defaultValues: {
      description: undefined,
      duration: undefined,
      price: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof ReservationOptionSchema>) => {
    setError('');
    setSuccess('');

    startTransition(() => {
      createReservationOption(values).then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess(data.success);
        }
      });
    });
  };

  return (
    <CardWrapper headerLabel="Dodaj opciju najma" className="shadow-md xs:w-[350px] sm:w-[500px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vrijeme trajanja (minuta): </FormLabel>
                  <FormControl>
                    <Input placeholder="Unesite vrijeme trajanja..." {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cijena (€): </FormLabel>
                  <FormControl>
                    <Input placeholder="Unesite cijenu najma..." {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vrsta najma: </FormLabel>
                <FormControl className="w-full rounded-md border border-input bg-transparent p-2 text-sm shadow-sm">
                  <Select
                    {...field}
                    allowUndefined={false}
                    disabled={isPending}
                    className="w-full border border-gray-300 rounded-sm"
                    onChange={(e) => field.onChange(e.target.value)}
                    options={rentalOptionTypes.map((type) => ({
                      id: type,
                      label: type.replace(/_/g, ' '),
                    }))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            Dodaj opciju najma
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
