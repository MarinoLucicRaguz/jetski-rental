import * as z from "zod";

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
    jetski_registration: z.string().min(1,{
        message: "Registration is required!"
    }),
    jetski_status: z.enum(["available", "taken"]),
});

export const LocationSchema = z.object({
    location_name: z.string().min(1,{
        message: "Location name is required!"
    }),
});


export const JetskiReservationSchema = z.object({
    id: z.string(),
    startTime: z.date(),
    endTime: z.date(),
    jetSkiCount: z.number(),
    //promisliti kako ce tocno baza izgledati, many-to-many relation, kako provjeravamo status //

})