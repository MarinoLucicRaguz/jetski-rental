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
    jetski_id: z.number(),
    jetski_registration: z.string().min(1,{
        message: "Registration is required!"
    }).max(20,{
        message: "Maximum length is 20 characters!"
    }),
    jetski_location_id: z.number().nullable(),
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
    jetSkiCount: z.string().nullable(), 
    safariTour: z.enum(["yes","no"]).nullable(),
    reservation_location_id: z.number().nullable(),
    reservation_jetski_list: z.array(JetskiSchema),
})