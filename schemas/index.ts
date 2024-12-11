import * as z from 'zod';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { UserRole, UserStatus } from '@prisma/client';
import { DateTime } from 'luxon';

const zPhone = z.string().refine(
  (value) => {
    const phone = parsePhoneNumberFromString(value, 'NG');
    return phone && phone.isValid();
  },
  {
    message: 'Invalid phone number',
  }
);

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: 'Email is required!',
  }),
  password: z.string().min(8, { message: 'Minimum length is 8 charachters' }),
  name: z.string().min(1, {
    message: 'Name is required!',
  }),
});

export const ChangePassword = z.object({
  password: z.string().min(6, { message: 'Minimum length is 6 charachters!' }),
});
const userRoleErrorMessage = 'Invalid user role. Please select a valid role.';

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  user_role: z.nativeEnum(UserRole),
  user_location_id: z.number().nullable().optional(),
  contactNumber: zPhone,
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const EditUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email('Invalid email format'),
  user_role: z.nativeEnum(UserRole).refine((value) => Object.values(UserRole).includes(value as UserRole), {
    message: userRoleErrorMessage,
  }),
  user_location_id: z.number().nullable().optional(),
  contactNumber: zPhone,
});

export const JetskiSchema = z.object({
  registration: z.string().regex(/^(?:[A-Z]{2})-(?:\d{3,6})$/, {
    message: 'Niste unijeli pravilnu registraciju.',
  }),
  locationId: z.number().refine((id) => id !== 0, {
    message: 'Zaboravili ste odabrati lokaciju.',
  }),
  model: z
    .string()
    .min(1, {
      message: 'Niste unijeli model plovila.',
    })
    .max(50, {
      message: 'Molimo vas unesite manje od 50 znakova.',
    }),
  topSpeed: z
    .string()
    .transform((value) => {
      const [numberStr, unit] = value.split(' ');
      const number = parseFloat(numberStr);
      if (isNaN(number) || number <= 0 || number > 150) {
        return value;
      }
      if (unit === 'mph') {
        const kmh = Math.round(number * 1.60934);
        return `${kmh} km/h`;
      }
      return value;
    })
    .refine(
      (value) => {
        const [numberStr, unit] = value.split(' ');
        const number = parseFloat(numberStr);
        return !isNaN(number) && number > 0 && number <= 150 && (unit === 'km/h' || unit === 'mph');
      },
      {
        message: 'Brzina mora biti popraćena s mph ili km/h.',
      }
    ),
  manufacturingYear: z.coerce
    .number({ message: 'Molim vas unesite broj.' })
    .int()
    .min(1950, { message: 'Godina mora biti 1950 ili novija.' })
    .max(new Date().getFullYear() + 1, { message: 'Godina ne može biti nakon iduće godine.' }),
});

export const LocationSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: 'Molim vas unesite ime lokacije.',
    })
    .max(30, {
      message: 'Maksimalan broj znakova je 30.',
    }),
  managerId: z.string().nullable(),
});

const toUTC = (date: Date) => DateTime.fromJSDate(date).toUTC().toJSDate();

const todayUTC = toUTC(new Date());
todayUTC.setHours(0, 0, 0, 0);
console.log('Server Date (UTC):', new Date().toISOString());

export const JetskiReservationSchema = z.object({
  rentDate: z.date().refine((date) => date >= todayUTC, {
    message: "Rent date can't be in past!",
  }),
  startTime: z.date().refine((date) => date >= todayUTC, {
    message: 'Start time cannot be in the past!',
  }),
  endTime: z.date(),
  reservation_location_id: z.number(),
  reservation_jetski_list: z.array(z.any()),
  reservationOwner: z.string().regex(/^[a-zA-Z\s-]+$/, 'Name must contain only letters and space.'),
  contactNumber: zPhone,
  totalPrice: z.number(),
  rentaloption_id: z.number(),
  discount: z.number(),
});

export const EditReservationSchema = z.object({
  reservation_id: z.number(),
  rentDate: z.date().refine((date) => date >= todayUTC, {
    message: "Rent date can't be in past!",
  }),
  startTime: z.date().refine((date) => date >= todayUTC, {
    message: 'Start time cannot be in the past!',
  }),
  endTime: z.date(),
  reservation_location_id: z.number(),
  reservation_jetski_list: z.array(z.any()),
  reservationOwner: z.string().regex(/^[a-zA-Z\s-]+$/, 'Name must contain only letters and space.'),
  contactNumber: zPhone,
  totalPrice: z.number(),
  rentaloption_id: z.number(),
  discount: z.number(),
});

export const ReservationOptionSchema = z.object({
  rentaloption_description: z.string().min(3, {
    message: 'Please provide a small description.',
  }),
  duration: z.string(),
  rentalprice: z.string().refine(
    (value) => {
      const regex = /^\d{1,3}(,\d{3})*(\.\d+)?\s(?:€|\$|£|HRK)$/;
      return regex.test(value);
    },
    {
      message: 'Rental price must be a valid numeric amount followed by a space and currency symbol (€, $, £, or HRK).',
    }
  ),
});
