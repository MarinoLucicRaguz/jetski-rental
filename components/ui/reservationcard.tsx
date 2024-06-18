import { getTodayReservationByLocation } from "@/actions/getTodaysReservationsByLocation";
import { ExtendedReservation } from "@/types";
import { Jetski, Location, RentalOptions } from "@prisma/client";
import { useEffect, useState } from "react";
import { getAllReservationOptions } from "@/actions/listReservationOptions";
import { Button } from "../ui/button";
import Modal from "./Modal";

interface ReservationCardProps {
    location: Location
}

const ReservationCard: React.FC<ReservationCardProps> = ({ location }) =>{
    const [reservations, setReservations] = useState<ExtendedReservation[] | null>([]);
    const [reservationOptions, setReservationOptions] = useState<RentalOptions[]|null>([]);
    const [error,setError] = useState<string|undefined>("");
    const [selectedReservation, setSelectedReservation] = useState<ExtendedReservation|null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(()=>{
        const fetchReservations = async () =>{
        try{
            const data = await getTodayReservationByLocation(location.location_id);
            setReservations(data);
            const option = await getAllReservationOptions();
            setReservationOptions(option);
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
            return `${hours} hours`
        }
        if(hours==0)
        {
            return `${minutes} minutes`
        }
        return `${hours}h and ${minutes} minutes`;
    };
    
    const handleOpenModal = (reservation: ExtendedReservation) => {
        setSelectedReservation(reservation);
        setIsModalOpen(true);
    };

    const handleCloseModal = () =>{
        setIsModalOpen(false);
    }

    const getReservationStatusColor = (reservation: ExtendedReservation) => {
        const now = new Date();
        const startTime = new Date(reservation.startTime);

        const hasUnavailableJetski = reservation.reservation_jetski_list?.some((jetski: Jetski) => jetski.jetski_status != "AVAILABLE");

        if (reservation.isCurrentlyRunning){
            return "bg-green-400"
        } else if (reservation.hasItFinished){
            return "bg-gray-400"
        }  else if (hasUnavailableJetski) {
            return "bg-red-400";
        }else if (now < startTime || !reservation.isCurrentlyRunning){
            return "bg-yellow-400";
        } else {
            return "";
        }
    };

    return (
        <div className="p-4 border rounded-lg shadow-md bg-white w-full max-w-3xl ">
            <h3 className="text-center text-sm font-bold mb-2">{location.location_name}</h3>
            {error && <p className="text-red-500">{error}</p>}
            {reservations && reservations.length > 0 ? (
                <div className="space-y-2 w-full">
                {reservations.map((reservation) => (
                    <div key={reservation.reservation_id} className={`border rounded-lg p-4 shadow-sm flex flex-col ${getReservationStatusColor(reservation)}`}>
                        <div className="flex flex-wrap">
                            <span className="flex-shrink-0 min-w-max text-sm"><strong>Info:</strong> {reservation.reservation_jetski_list?.length} x Jetski for {calculateDuration(reservation.startTime, reservation.endTime)}</span>
                        </div>
                        <div className="flex flex-wrap">
                            <span className="flex-shrink-0 min-w-max text-sm"><strong>Type: </strong>{reservationOptions
                                ?.find((rentalOption) => rentalOption.rentaloption_id === reservation.rentaloption_id)
                                ?.rentaloption_description.toLocaleLowerCase()
                                .replace(/^\w/, (c) => c.toLocaleUpperCase())}{" "}
                            rent</span>
                        </div>
                        <div className="flex flex-wrap">
                            <span className="flex-shrink-0 min-w-max text-sm"><strong>Time:</strong> {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        </div>
                        <div className="flex align-left">
                            <Button variant="ghost" onClick={()=>handleOpenModal(reservation)}>Show jetskis</Button>
                        </div>
                    </div>
                    ))}
                </div>
            ) : (
                <p>No remaining reservations today.</p>
            )}
            {isModalOpen && selectedReservation && (
                <Modal onClose={handleCloseModal}>
                    <h2 className="text-lg font-bold mb-2">Jetskis for selected reservation</h2>
                    <ul className="list-disc pl-5">
                        {selectedReservation.reservation_jetski_list?.map((jetski) => (
                            <li key={jetski.jetski_id} className={jetski.jetski_status === "AVAILABLE" ? "text-green-700" : "text-red-700"}>{jetski.jetski_registration}</li>
                        ))}
                    </ul>
                </Modal>
            )}

            </div>
      );
};
    
export default ReservationCard;