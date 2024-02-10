"use server";
import { db } from "@/lib/db";
import * as z from "zod";

import { JetskiReservationSchema } from "@/schemas";
import { getLocationById } from "@/data/jetski";

export const createReservation = async (values: z.infer<typeof JetskiReservationSchema>) => {
    const validatedFields = JetskiReservationSchema.safeParse(values);
    console.log(values)
    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const {rentDate, startTime, endTime, jetSkiCount, reservation_jetski_list, safariTour ,reservation_location_id } = validatedFields.data;


    if (reservation_location_id){
        const existingLocation = await getLocationById(reservation_location_id);

        if (!existingLocation) {
            return { error: "Location does not exist" };
        }
    }

    if(!reservation_location_id){
        return { error: "No location ID!"}
    }

    try {
        const reservation = await db.reservation.create({
            data: {
                startTime,
                endTime,
                safariTour: false,
                jetskiCount: jetSkiCount,
                reservation_jetski_list: {
                    connect: reservation_jetski_list.map((jetski: { jetski_id: number }) => ({
                        jetski_id: jetski.jetski_id,
                    })),
                },
                reservation_location: {
                    connect: { location_id: reservation_location_id },
                },
            },
        });
        

        return {
            success: "Reservation has been created successfully!",
            reservation,
        };
    } catch (error) {
        console.error("Error creating reservation:", error);
        return { error: "An error occurred while creating the reservation" };
    }
};
