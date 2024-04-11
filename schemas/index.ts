import * as z from "zod";
import { Jetski } from "@prisma/client";

//RAZMISLITI OCEMO LI KORISTITI EMAIL KASNIJE
//baci malo oko na ZOD, kako cemo koristiti username

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

export const JetskiSchema = z.object({
    jetski_registration: z.string().regex(
        /^(?:[A-Z]{2})-(?:\d{3,6})$/, {
            message: "Registration must start with 2 letters representing a city followed by a hyphen and 3 to 6 numbers. For example: ST-123456"
        }
    ),
    jetski_location_id: z.number().nullable().refine((jetski_location_id) => {
        if (jetski_location_id === null) {
            return false;
        } else {
            return true;
        }
    }, {
        message: "Please select a location.",
    }),
    jetski_model: z.string().min(1, {
        message: "Model is required."
    }).max(50, {
        message: "Maximum length is 50 characters!"
    }),
    jetski_topSpeed: z.string().refine((value) => {
        const [numberStr, unit] = value.split(' ');
        const number = parseInt(numberStr);
        
        if (isNaN(number) || number <= 0 || number > 150) {
            return false;
        }
        
        if (unit === 'mph') {
            const kmh = Math.round(number * 1.60934);
            return kmh
        }
        
        if (unit === 'kmh') {
            return number
        }

        return false;
    }, {
        message: "Top speed must be higher than zero, followed by 'mph' or 'kmh'!"
    }),
    jetski_kW: z.string().refine((value) => {
        const kW = parseFloat(value);
        return !isNaN(kW) && kW >= 0;
    }, {
        message: "kW must be bigger than zero."
    }),
    jetski_manufacturingYear: z.string().refine((value) => {
        const year = parseInt(value);
        return !isNaN(year) && year >= 1950 && year <= new Date().getFullYear() + 1;
    }, {
        message: "Manufacturing year must be a year between next one and 1950. "
    })
});

export const LocationSchema = z.object({
    location_name: z.string().min(1,{
        message: "Location name is required!"
    }).max(30,{
        message: "Maximum length is 30 characters!"
    }),
});


export const JetskiReservationSchema = z.object({
    rentDate: z.date(),
    startTime: z.date(),
    endTime: z.date().nullable(),
    jetSkiCount: z.number(), 
    safariTour: z.string(),
    reservation_location_id: z.number(),
    reservation_jetski_list: z.array(JetskiSchema),
})