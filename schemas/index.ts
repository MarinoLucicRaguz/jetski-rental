import * as z from "zod";
import parsePhoneNumberFromString from 'libphonenumber-js';
import { UserRole, UserStatus } from "@prisma/client";

const zPhone = z.string().refine((value) => {
    const phone = parsePhoneNumberFromString(value, 'NG');
    return phone && phone.isValid();
  }, {
    message: "Invalid phone number"
});
  

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email is required"
    }),
    password: z.string().min(1,{message: "Password is required"}),
});

export const RegisterSchema = z.object({
    email: z.string().email({
        message: "Email is required!"
    }),
    password: z.string().min(6,{message: "Minimum length is 6 charachters"}),
    name: z.string().min(1,{
        message: "Name is required!"
    })
});

export const ChangePassword = z.object({
    password: z.string().min(6, {message: "Minimum length is 6 charachters!"}),
})
const userRoleErrorMessage = "Invalid user role. Please select a valid role.";

export const CreateUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    user_role: z.nativeEnum(UserRole),
    user_location_id: z.number().nullable().optional(),
    contactNumber: zPhone,
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const EditUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email("Invalid email format"),
    user_role: z.nativeEnum(UserRole).refine(value => Object.values(UserRole).includes(value as UserRole), {
        message: userRoleErrorMessage,
      }),
    user_location_id: z.number().nullable().optional(),
    contactNumber: zPhone,
});

export const JetskiSchema = z.object({
    jetski_registration: z.string().regex(
        /^(?:[A-Z]{2})-(?:\d{3,6})$/, {
            message: "Registration must start with 2 letters representing a city followed by a hyphen and 3 to 6 numbers. For example: ST-123456"
        }
    ),
    jetski_location_id: z.number().nullable(),
    jetski_model: z.string().min(1, {
        message: "Model is required."
    }).max(50, {
        message: "Maximum length is 50 characters!"
    }),
    jetski_topSpeed: z.string()
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
        .refine((value) => {
            const [numberStr, unit] = value.split(' ');
            const number = parseFloat(numberStr);
            return !isNaN(number) && number > 0 && number <= 150 && (unit === 'km/h' || unit === 'mph');
        }, {
            message: "Top speed must be a positive number up to 150, followed by 'mph' or 'km/h'."
        }),
    jetski_kW: z.string().refine((value) => {
        return !isNaN(parseFloat(value)) && parseFloat(value) >= 0;
    }, {
        message: "kW must be a valid number and bigger than or equal to zero."
    }),
    jetski_manufacturingYear: z.string().refine((value) => {
        return value.length === 4 &&
               !isNaN(parseInt(value)) &&
               parseInt(value) >= 1950 &&
               parseInt(value) <= new Date().getFullYear() + 1;
    }, {
        message: "Manufacturing year must be a four-digit year between next one and 1950."
    })
});

export const LocationSchema = z.object({
    location_name: z.string().min(1,{
        message: "Location name is required!"
    }).max(30,{
        message: "Maximum length is 30 characters!"
    }),
    user_id: z.string().nullable()
});

const today = new Date();
today.setHours(0,0,0,0);

export const JetskiReservationSchema = z.object({
    rentDate: z.date().refine(date => date>=today,
        {
            message: "Rent date can't be in past!",
        }
    ),
    startTime: z.date().refine(date => date>=today,{
        message: "Start time cannot be in the past!"
    }),
    endTime: z.date(),
    reservation_location_id: z.number(),
    reservation_jetski_list: z.array(z.any()),
    reservationOwner: z.string().regex(/^[a-zA-Z\s-]+$/, "Name must contain only letters and space."),
    contactNumber: zPhone,
    totalPrice: z.number(),
    rentaloption_id: z.number(),
    discount: z.number(),
})

export const EditReservationSchema = z.object({
    reservation_id: z.number(),
    rentDate: z.date().refine(date => date>=today,
        {
            message: "Rent date can't be in past!",
        }
    ),
    startTime: z.date().refine(date => date>=today,{
        message: "Start time cannot be in the past!"
    }),
    endTime: z.date(),
    reservation_location_id: z.number(),
    reservation_jetski_list: z.array(z.any()),
    reservationOwner: z.string().regex(/^[a-zA-Z\s-]+$/, "Name must contain only letters and space."),
    contactNumber: zPhone,
    totalPrice: z.number(),
    rentaloption_id: z.number(),
    discount: z.number(),
})

export const ReservationOptionSchema = z.object({
    rentaloption_description: z.string().min(3, {
        message: "Please provide a small description."
    }),
    duration: z.string(),
    rentalprice: z.string().refine(value => {
        const regex = /^\d{1,3}(,\d{3})*(\.\d+)?\s(?:€|\$|£|HRK)$/;
        return regex.test(value);
    }, {
        message: "Rental price must be a valid numeric amount followed by a space and currency symbol (€, $, £, or HRK)."
    })
    
});