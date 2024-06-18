import { ExtendedReservation } from "@/types";
import { Jetski, Location } from "@prisma/client";
import { useState } from "react";

interface JetskiReservationCardProps {
    jetski: Jetski;
    reservations: ExtendedReservation[];
    locations: Location[];
}

const JetskiReservationCard: React.FC<JetskiReservationCardProps> = ({ jetski, reservations, locations }) => {
    const [error, setError] = useState<string | undefined>("");

    const getBackgroundColor = (reservation: ExtendedReservation, jetski: Jetski) => {
        const now = new Date();
        const startTime = new Date(reservation.startTime);
        const endTime = new Date(reservation.endTime);

        if (jetski.jetski_status !== "AVAILABLE") {
            return { backgroundColor: "bg-red-400", statusText: "Jetski isn't available" };
        }

        const anyJetskiNotAvailable = reservation.reservation_jetski_list.some(jetskiItem =>
            jetskiItem.jetski_id !== jetski.jetski_id && jetskiItem.jetski_status !== "AVAILABLE"
        );

        if (anyJetskiNotAvailable) {
            return { backgroundColor: "bg-purple-200", statusText: "Other jetski in reservation isn't available" };
        } else if (reservation.isCurrentlyRunning) {
            return { backgroundColor: "bg-green-200", statusText: "Reservation is currently running" };
        } else if (now < startTime) {
            return { backgroundColor: "bg-yellow-200", statusText: "Reservation is upcoming" };
        } else if (now >= startTime && now <= endTime) {
            return { backgroundColor: "bg-blue-200", statusText: "Reservation is ongoing" };
        } else if (reservation.hasItFinished || (reservation.endTime<=now && !reservation.isCurrentlyRunning)) {
            return { backgroundColor: "bg-gray-200", statusText: "Reservation has finished" };
        } else {
            return { backgroundColor: "bg-gray-200", statusText: "Unknown status" };
        }
    };

    const getLocationName = (locationId: number) => {
        const location = locations.find(loc => loc.location_id === locationId);
        return location ? location.location_name : "Unknown location";
    };

    const jetskiReservations = reservations.filter(reservation =>
        reservation.reservation_jetski_list.some(jetskiItem => jetskiItem.jetski_id === jetski.jetski_id)
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return (
        <div className="p-4 border rounded-lg shadow-md bg-white w-full max-w-3xl">
            <h3 className="text-center text-sm font-bold mb-2">{jetski.jetski_registration}</h3>
            {error && <p className="text-red-500">{error}</p>}
            {jetskiReservations.length > 0 ? (
                <div className="space-y-4">
                    {jetskiReservations.map((reservation) => {
                        const { backgroundColor, statusText } = getBackgroundColor(reservation, jetski);
                        return (
                            <div key={reservation.reservation_id} className="border rounded-lg shadow-sm flex flex-col p-4 space-y-2">
                                <div className="flex flex-col space-y-1">
                                    <h4 className="font-bold">Reservation Details</h4>
                                    <p><span className="font-semibold">Location:</span> {getLocationName(reservation.reservation_location_id)}</p>
                                    <p><span className="font-semibold">Time:</span> {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                                </div>
                                <div className={`rounded-lg shadow-sm flex flex-col p-2 ${backgroundColor}`}>
                                    <h4 className="font-bold">Reservation Status</h4>
                                    <p className="text-sm">{statusText}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center text-gray-500">No reservations today.</p>
            )}
        </div>
    );
};

export default JetskiReservationCard;
