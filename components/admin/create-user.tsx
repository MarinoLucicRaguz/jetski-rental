'use client';

import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useTransition } from 'react';
import { CreateUserSchema } from '@/schemas';
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
import { User, Location } from '@prisma/client';
import { createUser } from '@/actions/createUser';
import { getAllLocations } from '@/actions/getAllLocations';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import ErrorPopup from '../ui/errorpopup';
import { PhoneInput } from 'react-international-phone';
import bcrypt from 'bcryptjs';
import 'react-international-phone/style.css';

export const CreateUserPage = () => {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();
  const [locationData, setLocationData] = useState<Location[]>([]);
  const [showError, setShowError] = useState(false);
  const router = useRouter();
  const user = useCurrentUser();
  const [phone, setPhone] = useState<string>('');
  const [isValidPhoneNumber, setIsValidPhoneNumber] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      setShowError(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }
  }, [user, router]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        startTransition(() => {
          setError('');
        });

        const locations = await getAllLocations();
        if (locations) {
          setLocationData(locations);
        }
      } catch (error) {
        setError('Error fetching locations');
      }
    };

    fetchLocations();
  }, [startTransition]);

  const form = useForm<z.infer<typeof CreateUserSchema>>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      user_role: undefined,
      user_location_id: null,
      contactNumber: '',
    },
  });

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

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setIsValidPhoneNumber(!!value);
  };

  const onSubmit = async (values: z.infer<typeof CreateUserSchema>) => {
    setError('');
    setSuccess('');

    if (!isValidPhoneNumber) {
      setError('Invalid phone number.');
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(values.password, 10);

      const data = await createUser({
        ...values,
        contactNumber: phone,
        password: hashedPassword,
      });
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess('User successfully created');
        setTimeout(() => {
          router.push('/admindashboard');
        }, 1500);
      }
    } catch (error) {
      setError('An error occurred while creating the user');
    }
  };

  return (
    <CardWrapper
      headerLabel="Create User"
      backButtonLabel="Go back to user list"
      backButtonHref="/user/listuser"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4 flex-row justify-between">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Name"
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Email"
                      value={field.value || ''}
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Password"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Controller
              control={form.control}
              name="contactNumber"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <PhoneInput
                      defaultCountry="HR"
                      value={phone}
                      onChange={(value) => {
                        handlePhoneChange(value);
                        field.onChange(value);
                      }}
                      inputProps={{
                        name: field.name,
                        onBlur: field.onBlur,
                        className: `w-full px-3 py-2 border ${fieldState.error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-opacity-50 ${fieldState.error ? 'focus:border-red-500 focus:ring-red-200' : 'focus:border-blue-300 focus:ring-blue-200'}`,
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="user_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isPending}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-opacity-50 focus:border-blue-300 focus:ring-blue-200"
                    >
                      <option value="">Select Role</option>
                      <option value="ADMIN">Administrator</option>
                      <option value="MODERATOR">Manager</option>
                      <option value="USER">Worker</option>
                      <option value="GUEST">New User</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="user_location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isPending}
                      value={
                        field.value !== null
                          ? field.value && field.value.toString()
                          : ''
                      }
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || null)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-opacity-50 focus:border-blue-300 focus:ring-blue-200"
                    >
                      <option value="">No location</option>
                      {locationData.map((location) => (
                        <option
                          key={location.location_id}
                          value={location.location_id.toString()}
                        >
                          {location.location_name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="flex w-full" disabled={isPending}>
            Create
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
