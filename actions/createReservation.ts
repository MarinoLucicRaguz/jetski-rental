"use server";
import { db } from "@/lib/db";
import * as z from "zod";

import { JetskiReservationSchema } from "@/schemas";
import { DateTime } from "luxon";
import { listAvailableJetskis } from "./listAvailableJetskis";

export const createReservation = async (values: z.infer<typeof JetskiReservationSchema>) => {
    // Validate the input values
    const validatedFields = JetskiReservationSchema.safeParse(values);
    
    // Check if validation was successful
    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    // Destructure the validated data
    const { startTime, endTime, reservation_jetski_list, jetSkiCount, reservation_location_id, safariTour } = validatedFields.data;

    const currentTime = DateTime.now().toJSDate();

    if(currentTime>startTime)
    {
        return { error: "You have selected a starting time that has already passed!"}
    }

    // Calculate the number of jetskis
    const count = reservation_jetski_list.length;

    // Check if endTime is provided
    if (!endTime) {
        return { error: "Error while calculating when the rent should finish. Please check the start time and duration." }
    }

    const dataList = await listAvailableJetskis(startTime,endTime);

    const allJetskisAvailable = reservation_jetski_list.every(jetskiId =>
        dataList.some(jetski => jetski.jetski_id === jetskiId.jetski_id)
    );
    
    if (!allJetskisAvailable) {
        return { error: "Selected jetskis are not available at selected time."}
    }

    // Check if jetskis have been selected
    if (!jetSkiCount) {
        return { error: "No jetskis have been selected." }
    }

    if(!reservation_location_id)
    {
        return{ error: "You have set a location ID that does not exist."}
    }
    // Define a temporary location ID for testing

    if(!safariTour)
    {
        return {error: "You have not selected safari tour status."}
    }

    let isSafari;
    if(safariTour==="yes")
    {
        isSafari=true;
    }
    else{
        isSafari=false;
    }

    try {
        // Create the reservation in the database
        const reservation = await db.reservation.create({
            data: {
                startTime,
                endTime,
                safariTour: isSafari,
                jetskiCount: jetSkiCount,
                reservation_jetski_list: {
                    connect: reservation_jetski_list.map(jetski => ({ jetski_id: jetski.jetski_id }))
                },
                reservation_location: {
                    connect: { location_id: reservation_location_id },
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

