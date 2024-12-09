'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useTransition } from 'react';
import { editLocation } from '@/actions/editLocation';
import { pullLocationById } from '@/actions/getLocation';
import { LocationSchema } from '@/schemas';
import { Input } from '../atoms/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { CardWrapper } from '@/components/auth/card-wrapper';
import { Button } from '../ui/button';
import { FormError } from '../form-error';
import { FormSuccess } from '../form-success';
import { Location, User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import ErrorPopup from '../ui/errorpopup';
import { getAuthUsers } from '@/actions/getAuthUsers';
import { MenuItem, Select } from '@mui/material';
import { getModUsers } from '@/actions/getModUsers';

export const EditLocationForm = ({ locationId }: { locationId: number }) => {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();
  const [locationName, setLocationName] = useState<string>('');
  const [locationData, setLocationData] = useState<Location | null>();
  const [users, setUsers] = useState<User[]>([]);

  const [showError, setShowError] = useState(false);
  const router = useRouter();

  const user = useCurrentUser();

  const form = useForm<z.infer<typeof LocationSchema>>({
    resolver: zodResolver(LocationSchema),
    defaultValues: {
      location_name: locationName,
      user_id: locationData?.location_manager_id || '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pulledLocationData, users] = await Promise.all([pullLocationById(locationId), getModUsers()]);
        setLocationData(pulledLocationData);
        if (users) {
          setUsers(users);
        }
        if (pulledLocationData) {
          form.reset({
            location_name: pulledLocationData.location_name,
            user_id: pulledLocationData.location_manager_id || '',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [locationId, form]);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      setShowError(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }
  }, [user, router]);

  if (user && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    return <>{showError && <ErrorPopup message="You need to be an administrator to view this page." onClose={() => setShowError(false)} />}</>;
  }

  const onSubmit = async (values: z.infer<typeof LocationSchema>) => {
    setError('');
    setSuccess('');
    try {
      const data = await editLocation(locationId, values);
      setError(data.error || '');
      setSuccess(data.success || '');
    } catch (error) {
      setError('An error occurred while editing the location');
    }
  };

  return (
    <CardWrapper headerLabel="Edit Location" backButtonLabel="Go back to location list" backButtonHref="/location/listlocation">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="location_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder={locationName} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {user && user.role === 'ADMIN' && (
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        displayEmpty
                        disabled={isPending}
                        className="w-full border border-gray-300 rounded-md"
                        size="small"
                        renderValue={(selected) => {
                          if (selected === '' || selected === undefined) {
                            return 'No manager';
                          } else {
                            const selectedUser = users?.find((user) => user.user_id === selected);
                            return selectedUser ? selectedUser.name || selectedUser.email : '';
                          }
                        }}
                        onChange={(e) => {
                          const selectedUserId = e.target.value;
                          form.setValue('user_id', selectedUserId === '' ? null : selectedUserId);
                        }}
                      >
                        <MenuItem value="">
                          <em>No manager</em>
                        </MenuItem>
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
            )}
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="flex w-full margin-right-5" disabled={isPending}>
            Save
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
