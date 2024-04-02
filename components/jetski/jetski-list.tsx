"use client"

import { useEffect, useState, useTransition } from "react";
import { listJetski } from "@/actions/listJetskis";
import { Jetski } from "@prisma/client";
import { CardWrapper } from "../auth/card-wrapper";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { deleteJetski } from "@/actions/deleteJetski";


export const ListJetski =() => {
    const [error, setError] = useState<string | undefined>("");
    const [jetskiData, setJetskiData] = useState<Jetski[] |null>([]); // Assuming jetskiData is an array, replace with the actual type if needed
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                startTransition(() => {
                    setError("");
                });

                const data = await listJetski();
                setJetskiData(data);
            } catch (error) {
                setError("Error fetching jetskis");
            }
        };

        fetchData();
    }, [startTransition]);

    const handleEditJetskiClick = (jetskiId: number) => {
        router.push(`/jetski/${jetskiId}/editjetski`);
    };

    const handleDeleteJetskiClick = async (jetskiId: number) => {
        try {
            await deleteJetski(jetskiId);
            // Update locationData after deletion
            setJetskiData((prevData) => prevData?.filter((jet) => jet.jetski_id !== jetskiId) || null);
        } catch (error) {
            setError("Error deleting jetski");
        }
    };  

    return (
        <CardWrapper headerLabel="LIST OF JETSKIS" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
            <div className="space-y-4">
                {jetskiData?.map((jetski) => (
                    <div className="flex items-center justify-between" key={jetski.jetski_id}>
                        <span >{jetski.jetski_registration} </span>
                        <div className="space-x-2">
                            <Button onClick={() => handleEditJetskiClick(jetski.jetski_id)}>Edit</Button>
                            <Button variant="destructive" onClick={() => handleDeleteJetskiClick(jetski.jetski_id)}>Delete</Button>
                            {/* are you sure button */}
                        </div>
                    </div>
                ))}
                {error && <div>Error: {error}</div>}
            </div>
        </CardWrapper>
    )
}