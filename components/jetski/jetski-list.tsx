"use client"

import * as z from "zod";
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useEffect, useState, useTransition } from "react";
import { listJetski } from "@/actions/listJetskis";
import { Jetski } from "@prisma/client";



export const ListJetski =() => {
    const [error, setError] = useState<string | undefined>("");
    const [jetskiData, setJetskiData] = useState<Jetski[] |null>([]); // Assuming jetskiData is an array, replace with the actual type if needed
    const [isPending, startTransition] = useTransition();

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

      
    return (
       <div>
            {jetskiData?.map((jetski) => (
                        <li key={jetski.jetski_id}>{jetski.jetski_registration} {jetski.jetski_status}</li>
                ))}
       </div>
        
    )
}