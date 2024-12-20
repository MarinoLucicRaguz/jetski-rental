'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useTransition } from 'react';
import { LocationSchema } from '@/schemas';
import { Input } from '@/components/atoms/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CardWrapper } from '@/components/auth/card-wrapper';
import { Button } from '@/components/atoms/button';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { createLocation } from '@/actions/locationActions/createLocation';
import { User } from '@prisma/client';
import { getModUsers } from '@/actions/getModUsers';
import { Select } from '@/components/atoms/select';

export const LocationForm = () => {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();
  const [managers, setManagers] = useState<User[]>([]);

  const form = useForm<z.infer<typeof LocationSchema>>({
    resolver: zodResolver(LocationSchema),
    defaultValues: {
      name: '',
      managerId: null,
    },
  });

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const managers = await getModUsers();
        if (managers) setManagers(managers);
      } catch (error) {
        setError('Unable to fetch users. There has been an error!');
      }
    };
    fetchManagers();
  }, []);

  const onSubmit = (values: z.infer<typeof LocationSchema>) => {
    setError('');
    setSuccess('');

    startTransition(() => {
      createLocation(values).then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess(data.success);
        }
      });
    });
  };

  return (
    <CardWrapper headerLabel="Dodaj lokaciju" className="shadow-md xs:w-[350px] sm:w-[500px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Naziv lokacije</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder="" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="managerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upravitelj</FormLabel>
                  <FormControl className="w-full rounded-md border border-input bg-transparent p-2 text-sm shadow-sm">
                    <Select
                      {...field}
                      disabled={isPending}
                      allowUndefined={true}
                      undefinedText="Nema upravitelja"
                      className="w-full border border-gray-300 rounded-sm"
                      onChange={(e) => field.onChange(e.target.value)}
                      options={managers.map((manager) => ({
                        id: manager.user_id,
                        label: manager.name ?? '',
                      }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            Add a location!
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
