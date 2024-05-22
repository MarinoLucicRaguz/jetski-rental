import { getTodayReservationByLocation } from "@/actions/getTodaysReservationsByLocation";
import { ExtendedReservation } from "@/types";
import { Location } from "@prisma/client";
import { useEffect, useState } from "react";

interface ReservationCardProps {
    location: Location
}

const ReservationCard: React.FC<ReservationCardProps> = ({ location }) =>{
    const [reservations, setReservations] = useState<ExtendedReservation[] | null>([]);
    const [error,setError] = useState<string|undefined>("");

    useEffect(()=>{
        const fetchReservations = async () =>{
        try{
            const data = await getTodayReservationByLocation(location.location_id);
            setReservations(data);
        } catch (error) {
            setError("Failed to fetch reservations");
            console.error("Failed to fetch reservations: ",error);
        }
    }
    fetchReservations()
    },[location.location_id])

    const calculateDuration = (startTime: Date, endTime: Date) => {
        const duration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        if(minutes==0)
        {
            return `${hours}`
        }
        return `${hours}h ${minutes}m`;
      };
    
    return (
        <div className="p-4 border rounded-lg shadow-md bg-white w-full max-w-3xl">
            <h3 className="text-center text-sm font-bold mb-2">{location.location_name}</h3>
            {error && <p className="text-red-500">{error}</p>}
            {reservations && reservations.length > 0 ? (
                <div className="space-y-2 w-full">
                {reservations.slice(0, 5).map((reservation) => (
                    <div key={reservation.reservation_id} className="border rounded-lg p-4 shadow-sm flex flex-col">
                    <div className="flex flex-wrap">
                        <span className="flex-shrink-0 min-w-max text-sm"><strong>Info:</strong> {reservation.reservation_jetski_list?.length}x{calculateDuration(reservation.startTime, reservation.endTime)}h</span>
                    </div>
                    <div className="flex flex-wrap">
                        <span className="flex-shrink-0 min-w-max text-sm"><strong>Time:</strong> {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                    </div>
                    <div className="flex flex-wrap">
                        <span className="flex-shrink-0 min-w-max text-sm"><strong>Name:</strong> {reservation.reservationOwner}</span>
                    </div>
                    <div className="flex flex-wrap">
                        <span className="flex-shrink-0 min-w-max text-sm"><strong>Phone:</strong> {reservation.contactNumber}</span>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <p>No remaining reservations today.</p>
            )}
            </div>


      );
};
    
export default ReservationCard;