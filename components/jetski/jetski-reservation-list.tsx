"use client"

import { useEffect, useState, useTransition } from "react";
import { Jetski, Reservation } from "@prisma/client";
import { CardWrapper } from "../auth/card-wrapper";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { getAllReservations } from "@/actions/listReservations";
import { listJetski } from "@/actions/listJetskis";


export const ListReservations = () => {
    const [error, setError] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const [reservationData, setReservationData] = useState<Reservation[]|null>([]);
    const [jetSkiData, setJetSkiData] = useState<Jetski[] | null>([]);
    
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                startTransition(() => {
                    setError("");
                });
                const data = await getAllReservations();
                const getJetskiData = await listJetski();
                setJetSkiData(getJetskiData);
                setReservationData(data);
            } catch (error) {
                setError("Error fetching reservations");
            }
        };

        fetchData();
    }, [startTransition]);

    return (
        <CardWrapper headerLabel="Edit Locations" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
            <div className="space-y-4">
                {reservationData?.map((reservation) => (
                    <div className="flex flex-col" key={reservation.reservation_id}>
                        <div className="border border-gray-200 rounded p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span>Reservation ID: {reservation.reservation_id}</span>
                                <span>Start Time: {new Date(reservation.startTime).toLocaleString()}</span>
                                <span>End Time: {new Date(reservation.endTime).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-wrap">
                                <span className="mr-2 mb-2">Jetskis:</span>
                                                             
                            </div>
                        </div>
                    </div>
                ))}
                {error && <div>Error: {error}</div>}
            </div>
        </CardWrapper>
    )
}
