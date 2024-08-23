'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useTransition } from 'react';
import { JetskiSchema } from '@/schemas';
import { Input } from '../ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { CardWrapper } from '@/components/auth/card-wrapper';
import { Button } from '../ui/button';
import { FormError } from '../form-error';
import { FormSuccess } from '../form-success';
import { Jetski } from '@prisma/client';
import { editJetski } from '@/actions/editJetski';
import { getJetski } from '@/actions/getJetski';
import { getAllLocations } from '@/actions/getAllLocations';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import ErrorPopup from '../ui/errorpopup';

export const EditJetskiForm = ({ jetskiId }: { jetskiId: number }) => {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();
  const [jetskiData, setJetskiData] = useState<Jetski>();
  const [locationData, setLocationData] = useState<
    { location_id: string; location_name: string }[]
  >([]);

  const [showError, setShowError] = useState(false);
  const router = useRouter();

  const user = useCurrentUser();

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      setShowError(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }
  }, [user, router]);

  const form = useForm<z.infer<typeof JetskiSchema>>({
    resolver: zodResolver(JetskiSchema),
    defaultValues: {
      jetski_registration: jetskiData?.jetski_registration,
      jetski_location_id: jetskiData?.jetski_location_id || null,
      jetski_model: jetskiData?.jetski_model,
      jetski_topSpeed: jetskiData?.jetski_topSpeed,
      jetski_kW: jetskiData?.jetski_kW,
      jetski_manufacturingYear: jetskiData?.jetski_manufacturingYear,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getJetski(jetskiId);
        if (data) {
          setJetskiData(data);
          form.setValue('jetski_registration', data.jetski_registration);
          form.setValue('jetski_model', data.jetski_model);
          form.setValue('jetski_topSpeed', data.jetski_topSpeed);
          form.setValue('jetski_kW', data.jetski_kW);
          form.setValue(
            'jetski_manufacturingYear',
            data.jetski_manufacturingYear
          );
          form.setValue(
            'jetski_location_id',
            data.jetski_location_id ? data.jetski_location_id : null
          );
        }
      } catch (error) {
        console.error('Error fetching location name:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        startTransition(() => {
          setError('');
        });

        const locations = await getAllLocations();
        if (locations) {
          const formattedLocations = locations.map((location) => ({
            location_id: String(location.location_id),
            location_name: location.location_name,
          }));
          setLocationData(formattedLocations);
        }
      } catch (error) {
        setError('Error fetching locations');
      }
    };

    fetchData();
  }, [startTransition]);

  if (user && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    return (
      <>
        {showError && (
          <ErrorPopup
            message="You need to be an administrator to view this page."
            onClose={() => setShowError(false)}
          />
        )}
      </>
    );
  }

  const onSubmit = async (values: z.infer<typeof JetskiSchema>) => {
    setError('');
    setSuccess('');

    values.jetski_registration = values.jetski_registration.toUpperCase();
    try {
      const data = await editJetski(jetskiId, values);
      setError(data.error || '');
      setSuccess(data.success || '');
    } catch (error) {
      setError('An error occurred while editing the location');
    }
  };

  return (
    <CardWrapper
      headerLabel="Edit Jetski"
      backButtonLabel="Go back to jetski list"
      backButtonHref="/jetski/listjetski"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4 flex-row justify-between">
            <FormField
              control={form.control}
              name="jetski_registration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder={jetskiData?.jetski_registration}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jetski_location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="border-solid sans-serif text-bold ">
                    Location:
                  </FormLabel>
                  <FormControl className="rounded-sm text-center bg-black text-white border-solid ml-80 w-40 p-2">
                    <select
                      {...field}
                      disabled={isPending}
                      value={field.value === null ? '' : field.value.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          value === '' ? null : parseInt(value, 10)
                        );
                      }}
                    >
                      <option value="">No location</option>
                      {locationData.map((location) => (
                        <option
                          key={location.location_id}
                          value={location.location_id.toString()}
                        >
                          {location.location_name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jetski_model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder={jetskiData?.jetski_model}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jetski_topSpeed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Top Speed</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder={jetskiData?.jetski_topSpeed.toString()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jetski_kW"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>kW</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder={jetskiData?.jetski_kW.toString()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jetski_manufacturingYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturing Year</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder={jetskiData?.jetski_manufacturingYear.toString()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            type="submit"
            className="flex w-full margin-right-5"
            disabled={isPending}
          >
            Save
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
