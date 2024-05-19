"use server";

import { db } from "@/lib/db";

import { getReservationById } from "@/data/reservationData";

export const deleteReservation = async (reservation_id: number) => {
    const existingReservation = await getReservationById(reservation_id);

    if (!existingReservation) {
        return { error: "Reservation with this ID does not exist!" }; // Should never happen, but just in case!
    }
    try {
        await db.reservation.delete({
            where: { 
                reservation_id
            }
        }
    );

        return { success: "Reservation deleted successfully!" };
    } catch (error) {
        return { error: "Failed to delete reservation!" };
    }
};
