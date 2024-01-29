"use client"

import { useEffect, useState, useTransition } from "react";
import { listLocation } from "@/actions/listLocations";
import { deleteLocation } from "@/actions/deleteLocation";
import { Location } from "@prisma/client";
import { CardWrapper } from "../auth/card-wrapper";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ButtonDestructive() {
    return <Button variant="destructive">Destructive</Button>
  }

export const ListLocation = () => {
    const [error, setError] = useState<string | undefined>("");
    const [locationData, setLocationData] = useState<Location[] | null>([]);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                startTransition(() => {
                    setError("");
                });

                const data = await listLocation();
                setLocationData(data);
            } catch (error) {
                setError("Error fetching locations");
            }
        };

        fetchData();
    }, [startTransition]);

    const handleEditClick = (locationId: number) => {
        // Redirect to the edit location page
        router.push(`/location/${locationId}/editlocation`);
    };

    const handleDeleteClick = async (locationId: number) => {
        try {
            await deleteLocation(locationId);
            // Update locationData after deletion
            setLocationData((prevData) => prevData?.filter((loc) => loc.location_id !== locationId) || null);
        } catch (error) {
            setError("Error deleting location");
        }
    };

    return (
        <CardWrapper headerLabel="Edit Locations" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
            <div className="space-y-4">
                {locationData?.map((location) => (
                    <div className="flex items-center justify-between" key={location.location_id}>
                        <span >{location.location_name}</span>
                        <div className="space-x-2">
                            <Button onClick={() => handleEditClick(location.location_id)}>Edit</Button>
                            <Button variant="destructive" onClick={() => handleDeleteClick(location.location_id)}>Delete</Button>
                        </div>
                    </div>
                ))}
                {error && <div>Error: {error}</div>}
            </div>
        </CardWrapper>
    );
};
