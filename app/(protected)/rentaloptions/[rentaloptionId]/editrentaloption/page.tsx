"use client"

import { EditReservationOptionForm } from "@/components/jetski/jetski-edit-rental-options";
import { useParams } from "next/navigation";

const EditJetSkiRentalOptions = () => {
    const { rentaloptionId } = useParams(); 

    const parsedrentalOptionId = Array.isArray(rentaloptionId) ? parseInt(rentaloptionId[0], 10) : parseInt(rentaloptionId, 10);
    console.log(parsedrentalOptionId)

    return (
        <EditReservationOptionForm rentalOptionId={parsedrentalOptionId}/>
    )
}

export default EditJetSkiRentalOptions;