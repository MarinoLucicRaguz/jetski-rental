"use server";
import { db } from "@/lib/db";
import * as z from "zod";

import { JetskiReservationSchema } from "@/schemas";
import { getLocationById } from "@/data/jetski";

export const createReservation = async (values: z.infer<typeof JetskiReservationSchema>) => {
    // Validate the input values
    const validatedFields = JetskiReservationSchema.safeParse(values);

    // Check if validation was successful
    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    // Destructure the validated data
    const { startTime, endTime, reservation_jetski_list } = validatedFields.data;

    // Calculate the number of jetskis
    const count = reservation_jetski_list.length;

    // Check if endTime is provided
    if (!endTime) {
        return { error: "Error while calculating when the tour should finish. Please check the start time and duration." }
    }

    // Check if jetskis have been selected
    if (!reservation_jetski_list.length) {
        return { error: "No jetskis have been selected." }
    }

    // Define a temporary location ID for testing
    const tempLocationId = 1;

    try {
        // Create the reservation in the database
        const reservation = await db.reservation.create({
            data: {
                startTime,
                endTime,
                safariTour: false,
                jetskiCount: count,
                reservation_jetski_list: {
                    connect: reservation_jetski_list.map(jetski => ({ jetski_id: jetski.jetski_id }))
                },
                reservation_location: {
                    connect: { location_id: tempLocationId },
                },
            }
        });

        // Return success message and the created reservation
        return {
            success: "Reservation has been created successfully!",
            reservation,
        };
    } catch (error) {
        // Handle errors
        console.error("Error creating reservation:", error);
        return { error: "An error occurred while creating the reservation" };
    }
};

