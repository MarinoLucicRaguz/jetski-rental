"use server";
import { db } from "@/lib/db";
import * as z from "zod";
import { EditReservationSchema } from "@/schemas";
import { DateTime } from "luxon";

export const editReservation = async (values: z.infer<typeof EditReservationSchema>) => {
    const validatedFields = EditReservationSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const {
        reservation_id,
        startTime,
        endTime,
        reservation_jetski_list,
        reservation_location_id,
        reservationOwner,
        contactNumber,
        totalPrice,
        rentaloption_id,
        discount
    } = validatedFields.data;

    const now = DateTime.now();
    const startDateTime = DateTime.fromJSDate(new Date(startTime));
    const endDateTime = DateTime.fromJSDate(new Date(endTime));

    // Check if the start time is in the past
    if (startDateTime < now) {
        return { error: "You have selected a starting time that has already passed!" };
    }

    // Ensure endTime is after startTime
    if (startDateTime >= endDateTime) {
        return { error: "End time must be after start time." };
    }

    // Validate location exists
    const locationExists = await db.location.findUnique({
        where: { location_id: reservation_location_id },
    });
    if (!locationExists) {
        return { error: "The specified location does not exist." };
    }

    // Check jet ski availability
    const jetskiAvailabilityChecks = reservation_jetski_list.map(async jetski => {
        const reservations = await db.reservation.findMany({
            where: {
                reservation_jetski_list: {
                    some: {
                        jetski_id: jetski.jetski_id,
                    },
                },
                AND: [
                    { startTime: { lt: endTime } },
                    { endTime: { gt: startTime } },
                    { reservation_id: { not: reservation_id } } // Exclude the current reservation
                ],
            },
        });

        return reservations.length === 0;
    });

    const results = await Promise.all(jetskiAvailabilityChecks);
    if (results.some(isAvailable => !isAvailable)) {
        return { error: "One or more jet skis are not available in the chosen time slot." };
    }

    try {
        const reservation = await db.reservation.update({
            where: { reservation_id },
            data: {
                startTime,
                endTime,
                reservationOwner,
                contactNumber,
                totalPrice,
                discount,
                reservation_location: {
                    connect: { location_id: reservation_location_id },
                },
                reservation_jetski_list: {
                    set: reservation_jetski_list.map(jetski => ({ jetski_id: jetski.jetski_id })),
                },
                rentaloption_id: rentaloption_id,
                },
        });

        return {
            success: "Reservation has been updated successfully!"
        };
    } catch (error) {
        console.error("Error updating reservation:", error);
        return { error: "An error occurred while updating the reservation." };
    }
};
