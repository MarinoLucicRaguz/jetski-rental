'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition, useEffect } from 'react';
import { JetskiSchema } from '@/schemas';
import { Input } from '../../atoms/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CardWrapper } from '@/components/auth/card-wrapper';
import { Button } from '../../ui/button';
import { FormError } from '../../form-error';
import { FormSuccess } from '../../form-success';
import { createJetski } from '@/actions/vehicleActions/createJetski';
import { getAllLocations } from '@/actions/getAllLocations';
import { Location } from '@prisma/client';
import { Select } from '@/components/atoms/select';

export const VehicleForm = () => {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();
  const [locations, setLocations] = useState<Location[]>([]);

  const form = useForm<z.infer<typeof JetskiSchema>>({
    resolver: zodResolver(JetskiSchema),
    defaultValues: {
      registration: '',
      locationId: 0,
      model: '',
      topSpeed: '',
      manufacturingYear: 2024,
    },
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getAllLocations();
        if (data !== null) {
          setLocations(data);
        }
      } catch (error) {
        console.error('Error fetching locations: ', error);
      }
    };

    fetchLocations();
  }, []);

  const onSubmit = async (values: z.infer<typeof JetskiSchema>) => {
    setError('');
    setSuccess('');

    startTransition(() => {
      createJetski(values).then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess(data.success);
        }
      });
    });
  };

  return (
    <CardWrapper className="shadow-md xs:w-[350px] sm:w-[500px]" headerLabel="Dodaj plovilo">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="registration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registracija</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder="DB-123456" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="border-solid sans-serif text-bold">Lokacija plovila:</FormLabel>
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
          <div className="space y-6">
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder="Yamaha Waverunner" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space y-6">
            <FormField
              control={form.control}
              name="topSpeed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maksimalna brzina</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder="50 mph" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space y-6">
            <FormField
              control={form.control}
              name="manufacturingYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Godina proizvodnje</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} type="number" placeholder="2024" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            Dodaj novo plovilo
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
