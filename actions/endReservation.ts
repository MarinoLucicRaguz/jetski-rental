"use server";

import { db } from "@/lib/db";
import { getReservationById } from "@/data/reservationData";

export const endReservation = async (reservation_id: number) => {
    const reservation = await getReservationById(reservation_id);

    if(!reservation)
        return { error: "The specified reservation does not exist." };

    try {
        await db.reservation.update({
            where: { reservation_id },
            data: {
                isCurrentlyRunning: false,
                hasItFinished: true,
            },
        });

        return { success: "Reservation has finished." };
    } catch (error) {
        console.error("Error starting reservation:", error);
        return { error: "An error occurred while starting the reservation." };
    }
};
