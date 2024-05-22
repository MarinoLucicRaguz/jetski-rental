"use client"
import { useEffect, useState, useMemo } from "react";
import { listJetski } from "@/actions/listJetskis";
import { Jetski, Location } from "@prisma/client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { deleteJetski } from "@/actions/deleteJetski";
import { listLocation } from "@/actions/listLocations";
import { Menu, MenuItem } from "@mui/material";
import Spinner from "../ui/spinner";
import { useCurrentUser } from "@/hooks/use-current-user";

export const ListJetski = () => {
    const [error, setError] = useState<string | undefined>("");
    const [jetskiData, setJetskiData] = useState<Jetski[] | null>([]);
    const [locationNames, setLocationNames] = useState<Location[] | null>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const router = useRouter();

    const user= useCurrentUser();

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const locations = await listLocation();
                setLocationNames(locations);
            } catch (error) {
                setError("Error fetching locations");
            }
        };

        const fetchJetskis = async () => {
            try {
                const jetskis = await listJetski();
                setJetskiData(jetskis);
            } catch (error) {
                setError("Error fetching jetskis");
            }
        };

        Promise.all([fetchLocations(), fetchJetskis()]).then(() => {
            setLoadingData(false); 
        });
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
            setJetskiData(prev => prev?.filter(jetski => jetski.jetski_id !== jetskiId) || []);
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

    const getLocationName = (locationId: number | null, locations: Location[] | null) => {
        if (locations === null) {
            return "No location";
        }
        const location = locations.find(loc => loc.location_id === locationId);
        return location ? location.location_name : "No location";
    };

    return (
        <div className="relative w-full h-full">
        {loadingData && 
        (<div className="flex justify-center items-center" style={{ backgroundColor: "#38bdf8" }}>
                <Spinner />
            </div>
        )}

        <div className={`p-10 bg-white rounded-sm ${loadingData ? "opacity-100" : ""}`}>
                <div className="flex flex-col space-y-4">
                    <div className="text-center text-2xl font-bold uppercase text-black">
                        {showOnlyAvailable ? "List of available jetskis" : "List of all jetskis"}
                    </div>
                    <div className="flex justify-between">
                        <Button onClick={handleClick}>Choose location as a filter</Button>
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
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Registration</th>
                                <th className="px-6 py-3">Model & Year</th>
                                <th className="px-6 py-3">Top Speed</th>
                                <th className="px-6 py-3">Availability</th>
                                <th className="px-6 py-3">Location</th>
                                {(user?.role==="ADMIN" || user?.role==="MODERATOR") && (
                                    <th className="px-6 py-3">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJetskis?.map(jetski => (
                                <tr key={jetski.jetski_id} className="bg-white border-b">
                                    <td className="px-6 py-4">{jetski.jetski_registration}</td>
                                    <td className="px-6 py-4">{`${jetski.jetski_model} ${jetski.jetski_manufacturingYear}`}</td>
                                    <td className="px-6 py-4">{jetski.jetski_topSpeed}</td>
                                    <td className="px-6 py-4">{jetski.jetski_status}</td>
                                    <td className="px-6 py-4">
                                        {getLocationName(jetski.jetski_location_id, locationNames)}
                                    </td>
                                    {(user?.role==="ADMIN" || user?.role==="MODERATOR") && (
                                    <td className="px-6 py-4">
                                        <Button onClick={() => handleEditJetskiClick(jetski.jetski_id)}>Edit</Button>
                                        <Button variant="destructive" onClick={() => handleDeleteJetskiClick(jetski.jetski_id)}>
                                            {jetski.jetski_status === 'AVAILABLE' ? "Remove" : "Return"}
                                        </Button>
                                    </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4 flex justify-center">
                        <a href="/dashboard" className="text-sm font-normal text-gray-500 hover:text-gray-700 hover:underline">Go back to dashboard</a>
                    </div>
                    {error && <div className="text-red-500">{`Error: ${error}`}</div>}
                </div>
            </div>
        </div>
    );
};
