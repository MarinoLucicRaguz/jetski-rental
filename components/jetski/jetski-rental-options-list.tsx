"use client"
import { useEffect, useState, useTransition } from "react";
import { RentalOptions } from "@prisma/client";
import { CardWrapper } from "../auth/card-wrapper";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAllReservationOptions } from "@/actions/listReservationOptions";
import { deleteRentalOption } from "@/actions/deleteRentalOption";

export const ListRentalOptions = () => {
    const [error, setError] = useState<string | undefined>("");
    const [rentalOptionsData, setRentalOptionsData] = useState<RentalOptions[] | null>([]);
    const [showUnavailable, setShowUnavailable] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                startTransition(() => {
                    setError("");
                });
                const data = await getAllReservationOptions();
                setRentalOptionsData(data);
            } catch (error) {
                setError("Error fetching rental options");
            }
        };

        fetchData();
    }, [startTransition]);

    useEffect(() => {
        const updateAvailable = async () => {
            try {
                const data = await getAllReservationOptions();
                setRentalOptionsData(data);
            } catch (error) {
                setError("Error fetching rental options");
            }
        };

        updateAvailable();
    }, [showUnavailable]);

    const handleEditClick = (rentaloption_id: number) => {
        router.push(`/rentaloptions/${rentaloption_id}/editrentaloption`);
    };


    const handleDeleteClick = async (rentaloption_id: number) => {
        try {
            await deleteRentalOption(rentaloption_id);
            setRentalOptionsData((prevData) => prevData?.filter((option) => option.rentaloption_id !== rentaloption_id) || null);
        } catch (error) {
            setError("Error deleting rental option");
        }
    };

    return (
        <div className="p-10 bg-white rounded-sm">
            <div className="mb-4">
                <div className="text-center text-2xl font-bold uppercase text-black">
                    {showUnavailable ?"List of available rental options": "List of all rental options"}
                </div>
                <div className="text-right p-2">
                    <Button onClick={() => setShowUnavailable(!showUnavailable)}>
                        {showUnavailable ? "Show only available rental options" : "Show all rental options"}
                    </Button>
                </div>
            </div>
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Type of rental</th>
                        <th className="px-4 py-2">Duration</th>
                        <th className="px-4 py-2">Availability</th>
                        <th className="px-4 py-2">Price</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rentalOptionsData?.map((rental) => (
                        (!showUnavailable || rental.isAvailable === true) && (
                            <tr key={rental.rentaloption_id}>
                                <td className="border px-4 py-2">{rental.rentaloption_description}</td>
                                <td className="border px-4 py-2">{rental.duration} minutes</td>
                                <td className="border px-4 py-2">{rental.isAvailable ? "Available" : "Not available"}</td>
                                <td className="border px-4 py-2">{rental.rentalprice.toPrecision(3)} €</td>
                                <td className="border px-4 py-2">
                                    <Button onClick={() => handleEditClick(rental.rentaloption_id)}>Edit</Button>
                                        {rental.isAvailable === true ? (
                                            <Button variant="destructive" onClick={() => handleDeleteClick(rental.rentaloption_id)}>Disallow rental option</Button>
                                        ) : (
                                            <Button variant="constructive" onClick={() => handleDeleteClick(rental.rentaloption_id)}>Allow rental option</Button>
                                        )}
                                    </td>
                            </tr>
                        )
                    ))}
                </tbody>
            </table>
            <div className="mt-4 flex justify-center">
                <a href="/dashboard" className="text-sm font-normal text-gray-500 hover:text-gray-700 hover:underline">Go back to dashboard</a>
            </div>
            {error && <div>Error: {error}</div>}
        </div>
    )
};