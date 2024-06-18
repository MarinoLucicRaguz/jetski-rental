"use server";

import { getFirstReservationsByJetskiIds } from "@/data/reservationData";

export const getReservationByJetskiIds = async(jetskiIds: number[])=>{
    const reservation = await getFirstReservationsByJetskiIds(jetskiIds)

    return reservation
}