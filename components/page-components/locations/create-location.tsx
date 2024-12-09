'use client';

import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useTransition } from 'react';
import { LocationSchema } from '@/schemas';
import { Input } from '@/components/atoms/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CardWrapper } from '@/components/auth/card-wrapper';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { createLocation } from '@/actions/createLocation';
import { User } from '@prisma/client';
import { MenuItem, Select } from '@mui/material';
import { getModUsers } from '@/actions/getModUsers';

export const LocationForm = () => {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();
  const [users, setUsers] = useState<User[] | null>([]);

  const form = useForm<z.infer<typeof LocationSchema>>({
    resolver: zodResolver(LocationSchema),
    defaultValues: {
      location_name: '',
      user_id: null,
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getModUsers();
        setUsers(users);
      } catch (error) {
        setError('Unable to fetch users. There has been an error!');
      }
    };
    fetchUsers();
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
    <CardWrapper headerLabel="Add location" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="location_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder="" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      disabled={isPending}
                      className="w-full border border-gray-300 rounded-sm"
                      size="small"
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected === null || selected === '') {
                          return <span>Select a manager</span>;
                        }
                        const selectedUser = users?.find((user) => user.user_id === selected);
                        return selectedUser ? selectedUser.name || selectedUser.email : '';
                      }}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    >
                      <MenuItem value="">No manager</MenuItem>
                      {users?.map((user) => (
                        <MenuItem key={user.user_id} value={user.user_id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
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
