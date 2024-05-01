"use client"
import { useEffect, useState, useTransition, useMemo } from "react";
import { listJetski } from "@/actions/listJetskis";
import { Jetski, Location } from "@prisma/client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation"; // Correct import for useRouter
import { deleteJetski } from "@/actions/deleteJetski";
import { listLocation } from "@/actions/listLocations";
import { Menu, MenuItem } from "@mui/material";
import Spinner from "../ui/spinner";

export const ListJetski = () => {
    const [error, setError] = useState<string | undefined>("");
    const [jetskiData, setJetskiData] = useState<Jetski[] | null>([]);
    const [locationNames, setLocationNames] = useState<Location[] | null>([]);
    const [isPending, startTransition] = useTransition();
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const locations = await listLocation();
                setLocationNames(locations);
            } catch (error) {
                setError("Error fetching locations");
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await listJetski();
                startTransition(() => {
                    setJetskiData(data);
                });
            } catch (error) {
                setError("Error fetching jetskis");
            }
        };
        fetchData();
    }, []);

    const filteredJetskis = useMemo(() => {
        return jetskiData?.filter(jetski =>
            (selectedLocation === null || jetski.jetski_location_id === selectedLocation) &&
            (!showOnlyAvailable || jetski.jetski_status === 'AVAILABLE')
        );
    }, [jetskiData, selectedLocation, showOnlyAvailable]);

    const handleEditJetskiClick = (jetskiId: number) => {
        router.push(`/jetski/${jetskiId}/editjetski`);
    };

    const handleDeleteJetskiClick = async (jetskiId: number) => {
        try {
            await deleteJetski(jetskiId);
        } catch (error) {
            setError("Error deleting jetski");
        }
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLocationSelect = (location_id: number | null) => {
        setSelectedLocation(location_id);
        setAnchorEl(null);
    };

    const getLocationName = (locationId: number, locations: Location[] | null) => {
        if (locations === null) {
            return "No location";
        }
        const location = locations.find(loc => loc.location_id === locationId);
        return location ? location.location_name : "No location";
    };
    

    return (
        <div className="p-10 bg-white rounded-sm">
            <div className="mb-4">
                <div className="text-center text-2xl font-bold uppercase text-black">
                    {showOnlyAvailable ? "List of available jetskis" : "List of all jetskis"}
                </div>
                <div className="text-right flex justify-end">
                    <Button onClick={handleClick}>
                        Choose location as a filter
                    </Button>
                    <Menu
                        open={Boolean(anchorEl)}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        >
                        <MenuItem onClick={() => handleLocationSelect(null)}>Display All</MenuItem>
                        {locationNames?.map((location) => (
                            <MenuItem key={location.location_id} onClick={() => handleLocationSelect(location.location_id)}>
                                {location.location_name}
                            </MenuItem>
                        ))}
                    </Menu>
                    <Button onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}>
                        {showOnlyAvailable ? "Show All Jetskis" : "Show Available Jetskis"}
                    </Button>
                </div>
            </div>
            {isPending && <Spinner/>}
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Registration</th>
                        <th className="px-4 py-2">Model & year</th>
                        <th className="px-4 py-2">Top speed</th>
                        <th className="px-4 py-2">Availability</th>
                        <th className="px-4 py-2">Location</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>    
                <tbody>
                    {filteredJetskis?.map(jetski => (
                        <tr key={jetski.jetski_id}>
                            <td className="border px-4 py-2">{jetski.jetski_registration}</td>
                            <td className="border px-4 py-2">{`${jetski.jetski_model} ${jetski.jetski_manufacturingYear}`}</td>
                            <td className="border px-4 py-2">{jetski.jetski_topSpeed}</td>
                            <td className="border px-4 py-2">{jetski.jetski_status}</td>
                            <td className="border px-4 py-2">
                                {jetski.jetski_location_id ? getLocationName(jetski.jetski_location_id, locationNames) : "No location"}
                            </td>
                            <td className="border px-4 py-2">
                                <Button onClick={() => handleEditJetskiClick(jetski.jetski_id)}>Edit</Button>
                                <Button variant="destructive" onClick={() => handleDeleteJetskiClick(jetski.jetski_id)}>
                                    {jetski.jetski_status === 'AVAILABLE' ? "Remove jetski" : "Return jetski"}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {error && <div className="mt-4 text-red-500">Error: {error}</div>}
        </div>
    );
};
