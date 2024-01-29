"use client"


import { useEffect, useState, useTransition } from "react";
import { listLocation } from "@/actions/listLocations";
import { Location } from "@prisma/client";
import { CardWrapper } from "../auth/card-wrapper";



export const ListLocation =() => {
    const [error, setError] = useState<string | undefined>("");
    const [locationData, setLocationData] = useState<Location[] |null>([]); // Assuming jetskiData is an array, replace with the actual type if needed
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const fetchData = async () => {
            try {
                startTransition(() => {
                    setError("");
                });

                const data = await listLocation();
                setLocationData(data);
            } catch (error) {
                setError("Error fetching location");
            }
        };

        fetchData();
    }, [startTransition]);

      
    return (
        <CardWrapper headerLabel="Edit an location" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
                        <div className="space-y-4">
                            {locationData?.map((location)=>(
                                <div key={location.location_id}> {location.location_name}
                                </div>
                            ))}
                        </div>
        </CardWrapper>
    //    <div>
    //         {locationData?.map((location) => (
    //                     <li key={location.location_id}>{location.location_name} </li>
    //             ))}
    //    </div>
        
    )
}