"use client";

import { useEffect, useMemo, useState } from "react";
import { CardWrapper } from "../auth/card-wrapper";
import { listReservationsByDate } from "@/actions/listReservationsForDate";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { Button } from "../ui/button";
import { CalendarIcon, TrashIcon, ClipboardCopyIcon, Pencil1Icon, DownloadIcon } from "@radix-ui/react-icons";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { Jetski, Location, RentalOptions, Reservation } from "@prisma/client";
import { listLocation } from "@/actions/listLocations";
import { Menu, MenuItem } from "@mui/material";
import { deleteReservation } from "@/actions/deleteReservation";
import { useRouter } from "next/navigation";
import { ExtendedReservation } from "@/types";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getAllReservationOptions } from "@/actions/listReservationOptions";
import { listJetski } from "@/actions/listJetskis";
import { startReservation } from "@/actions/startReservation";
import { endReservation } from "@/actions/endReservation";

type sortReservationBy = "startTime" | "totalPrice" | "reservationOwner" | "rentaloption_id" | "reservation_location_id";

const getStatusColor = (reservation: ExtendedReservation) => {
    const hasUnavailableJetski = reservation.reservation_jetski_list.some(jetski => jetski.jetski_status !== "AVAILABLE");

    if (reservation.hasItFinished)
    {
        return { color: 'bg-gray-500', label: 'Finished' };
    }

    if (hasUnavailableJetski) {
        return { color: 'bg-red-500', label: 'Issue' };
    } else if (reservation.isCurrentlyRunning) {
        return { color: 'bg-green-500', label: 'Running' };
    } else if (!reservation.hasItFinished) {
        return { color: 'bg-yellow-500', label: 'Pending' };
    } else {
        return { color: 'bg-gray-500', label: 'Finished' };
    }
};



export const ListReservations = () => {
    const [error, setError] = useState("");
    const [reservationData, setReservationData] = useState<ExtendedReservation[]>([]);
    const [rentDate, setRentDate] = useState(new Date());
    const [locationNames, setLocationNames] = useState<Location[] | null>([]);
    const [jetskiData, setJetskiData] = useState<Jetski[]>([]);
    const [selectedJetski, setSelectedJetski] = useState<number | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
    const [locationAnchorEl, setLocationAnchorEl] = useState<null | HTMLElement>(null);    
    const [jetskiAnchorEl, setJetskiAnchorEl] = useState<null | HTMLElement>(null);
    const [confirmPopover, setConfirmPopover] = useState<null | number>(null);
    const [rentalOptions, setRentalOptions] = useState<RentalOptions[]>([])
    const [sortBy,setSortBy] = useState<sortReservationBy>("startTime");
    const [sortDirection, setSortDirection] = useState<"asc"|"desc">("asc");
    const router = useRouter();

    const user = useCurrentUser();

    useEffect(() => {
        const fetchLocationAndOptionsData = async () => {
            try {
                const locationData = await listLocation();
                setLocationNames(locationData);

                const rentaloptions = await getAllReservationOptions();
                if(rentaloptions)
                {
                    setRentalOptions(rentaloptions);
                }

                const jetskis = await listJetski();
                if(jetskis)
                {
                    setJetskiData(jetskis);
                }
            } catch (error) {
                setError("Failed to load locations: " + error);
            }
        };
        fetchLocationAndOptionsData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await listReservationsByDate(rentDate);
                if (data) {
                    data.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
                }
                setReservationData(data || []);
            } catch (error) {
                setError("Error fetching reservations: " + error);
            }
        };

        fetchData();
    }, [rentDate]);

    const handleSort = (key: sortReservationBy) =>
    {
        if(sortBy===key)
            setSortDirection(sortDirection === "asc" ? "desc":"asc");
        else{
            setSortBy(key);
            setSortDirection("asc");
        }
    }

    const filteredReservations = useMemo(() => {
        return reservationData.filter(reservation =>
            (selectedLocation === null || reservation.reservation_location_id === selectedLocation) &&
            (selectedJetski === null || reservation.reservation_jetski_list.some(jetski => jetski.jetski_id === selectedJetski))
        );
    }, [reservationData, selectedLocation, selectedJetski]);

    const sortedReservations = useMemo(() => {
        return [...filteredReservations].sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];
    
            if (aValue === bValue) return 0;
    
            if (sortDirection === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }, [filteredReservations, sortBy, sortDirection]);

    const handleEditButton = (reservationId: number) => {
        router.push(`/reservation/${reservationId}/editreservation`);
    };

    const handleStartReservationButton = async (reservation_id: number) => {
        try {
            const res = await startReservation(reservation_id);
            if (res.success) {
                setReservationData(prevReservations => {
                    return prevReservations.map(reservation => {
                        if (reservation.reservation_id === reservation_id) {
                            return {
                                ...reservation,
                                isCurrentlyRunning: true
                            };
                        }
                        return reservation;
                    });
                });
            }   
            else {
                setError(res?.error || "Unknown error occurred.");
            }
        } catch (error) {
            setError("Error while starting reservation.");
        }
    }
    
    const handleEndReservationButton = async (reservation_id: number) => {
        try {
            const res = await endReservation(reservation_id);
            if (res.success) {
                setReservationData(prevReservations => {
                    return prevReservations.map(reservation => {
                        if (reservation.reservation_id === reservation_id) {
                            return {
                                ...reservation,
                                isCurrentlyRunning: false,
                                hasItFinished: true,
                            };
                        }
                        return reservation;
                    });
                });
            } else {
                setError(res?.error || "Unknown error occurred.");
            }
        } catch (error) {
            setError("Error while ending reservation.");
        }
    }
    
    

    const handleLocationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setLocationAnchorEl(event.currentTarget);
      };
    
      const handleJetskiClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setJetskiAnchorEl(event.currentTarget);
      };

    const handleClose = () => {
        setLocationAnchorEl(null);
        setJetskiAnchorEl(null);
    };

    const handleLocationSelect = (location_id: number | null) => {
        setSelectedLocation(location_id);
        setLocationAnchorEl(null);
    };
    const handleJetskiSelect = (jetski_id: number | null) => {
        setSelectedJetski(jetski_id);
        setJetskiAnchorEl(null);
    };
    const handleDeleteClick = (reservation_id: number) => {
        setConfirmPopover(reservation_id);
    };

    const formatReservationsForClipboard = () => {
        return filteredReservations.map(reservation => {
            const location = locationNames?.find(loc => loc.location_id === reservation.reservation_location_id);
            const jetskis = reservation.reservation_jetski_list?.map(jetski => jetski.jetski_registration).join(" - ") || "";
            return `${reservation.reservation_jetski_list.length}x${(new Date(reservation.endTime).getTime() - new Date(reservation.startTime).getTime()) / 3600000}h ${rentalOptions?.find((rentalOption)=>rentalOption.rentaloption_id===reservation.rentaloption_id)?.rentaloption_description === "SAFARI" ? "safari" : "regular"} / ${reservation.reservation_location.location_name}  / ${jetskis} / ${reservation.reservationOwner} / ${reservation.totalPrice}€`;
        }).join("\n");
    };
    
    const copyToClipboard = () => {
        const formattedReservations = formatReservationsForClipboard();
        navigator.clipboard.writeText(formattedReservations);
    };
    
    const confirmDelete = async () => {
        if (confirmPopover !== null) {
            try {
                await deleteReservation(confirmPopover);
                setReservationData(prevData =>
                    prevData?.filter(option => option.reservation_id !== confirmPopover) || []
                );
                setConfirmPopover(null);
            } catch (error) {
                setError("Error while deleting reservation!");
            }
        }
    };

    const cancelDelete = () => {
        setConfirmPopover(null);
    };

    const formatReservationsForFile = () => {
        return sortedReservations.map(reservation => {
            const location = locationNames?.find(loc => loc.location_id === reservation.reservation_location_id);
            const jetskis = reservation.reservation_jetski_list?.map(jetski => jetski.jetski_registration).join(" - ") || "";
            const status = getStatusColor(reservation).label;

            return `\nOwner: ${reservation.reservationOwner}\nLocation: ${location?.location_name}\nJetskis: ${jetskis}\nStart Time: ${reservation.startTime}\nEnd Time: ${reservation.endTime}\nTotal Price: ${reservation.totalPrice}€\nStatus: ${status}\n\n`;
        }).join("\n");
    };

    const downloadReservationsAsFile = () => {
        const content = formatReservationsForFile();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `reservations_${format(rentDate, 'yyyyMMdd')}.txt`;
        link.click();

        URL.revokeObjectURL(url);
    };
    return (
        <CardWrapper headerLabel="Reservation Schedule" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard" className="shadow-md md:w-[750px] lg:w-[1500px]">
            <div className="p-4 bg-white shadow rounded-lg">
                <div className="my-4 flex justify-between">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"}>
                                {format(rentDate, "PPP")}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white" align="start">
                            <Calendar
                                mode="single"
                                selected={rentDate}
                                onSelect={(date) => {
                                    if (date) { setRentDate(date); }
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                    <div className="flex justify-between gap-2">
                        <div className="flex items-center">
                            <Button onClick={handleLocationClick}>{locationNames && locationNames?.find((location)=> location.location_id === selectedLocation)?.location_name || "All locations"}</Button>
                        </div>
                        <Menu open={Boolean(locationAnchorEl)} anchorEl={locationAnchorEl} onClose={handleClose}>
                            <MenuItem onClick={() => handleLocationSelect(null)}>All locations</MenuItem>
                            {locationNames?.map((location) => (
                                <MenuItem key={location.location_id} onClick={() => handleLocationSelect(location.location_id)}>
                                    {location.location_name}
                                </MenuItem>
                            ))}
                        </Menu>
                        <div className="flex items-center">
                            <Button onClick={handleJetskiClick}>{jetskiData && jetskiData?.find((jetski)=> jetski.jetski_id === selectedJetski)?.jetski_registration || "All jetskis"}</Button>
                        </div>
                        <Menu open={Boolean(jetskiAnchorEl)} anchorEl={jetskiAnchorEl} onClose={handleClose}>
                            <MenuItem onClick={() => handleJetskiSelect(null)}>All jetskis</MenuItem>
                            {jetskiData?.map((jetski) => (
                                <MenuItem key={jetski.jetski_id} onClick={() => handleJetskiSelect(jetski.jetski_id)}>
                                    {jetski.jetski_registration} / {locationNames?.find((location)=> location.location_id === jetski.jetski_location_id )?.location_name}
                                </MenuItem>
                            ))}
                        </Menu>
                    </div>
                </div>
                <Button onClick={copyToClipboard} className="mb-4">
                    <ClipboardCopyIcon className="mr-2" /> Copy to Clipboard
                </Button>
                <Button className="ml-2" onClick={downloadReservationsAsFile}>
                    <DownloadIcon className="mr-2 h-4 w-4" /> Save as
                </Button>
                <div className="p-10 bg-white rounded-sm ">
                    <div className="flex flex-col space-y-4">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("reservation_location_id")}>Location</th>
                                    <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("reservationOwner")}>Name</th>
                                    <th className="px-6 py-3">Contact</th>
                                    <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("totalPrice")}>Price</th>
                                    <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("startTime")}>Time</th>
                                    <th className="px-6 py-3">Jetskis</th>
                                    <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("rentaloption_id")}>Type</th>
                                    {(user?.role === "ADMIN" || user?.role === "MODERATOR") && (
                                        <th className="px-6 py-3">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedReservations?.map(reservation => {
                                    const location = locationNames?.find(loc => loc.location_id === reservation.reservation_location_id);
                                    const status = getStatusColor(reservation);
                                    return (
                                        <tr key={reservation.reservation_id} className="bg-white border-b">
                                             <td className="px-6 py-4">
                                                <span className={`inline-block w-3 h-3 mr-2 rounded-full ${status.color}`}></span>
                                                {status.label}
                                            </td>
                                            <td className="px-6 py-4">{location ? location.location_name : 'No location found'}</td>
                                            <td className="px-6 py-4">{reservation.reservationOwner}</td>
                                            <td className="px-6 py-4">{reservation.contactNumber}</td>
                                            <td className="px-6 py-4">{reservation.totalPrice} €</td>
                                            <td className="px-6 py-4">
                                                {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </td>
                                            <td className="px-6 py-4">
                                                {reservation.reservation_jetski_list && reservation.reservation_jetski_list.map(jetski => (
                                                    <div key={jetski.jetski_id} className={(jetski.jetski_status !== "AVAILABLE" && !reservation.hasItFinished)? "text-red-500" : ""}>
                                                        {jetski.jetski_registration}
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="px-6 py-4">{rentalOptions.find(rentalOptions => rentalOptions.rentaloption_id === reservation.rentaloption_id)?.rentaloption_description}</td>
                                            {(user?.role === "ADMIN" || user?.role === "MODERATOR") && (
                                                <td className="px-6 py-4">
                                                    <div className="flex">
                                                        {!reservation.hasItFinished ? (
                                                            <>
                                                                <Button 
                                                                    className="mr-2" 
                                                                    disabled={reservation.reservation_jetski_list.some(jetski => jetski.jetski_status !== "AVAILABLE")}
                                                                    onClick={() => reservation.isCurrentlyRunning ? handleEndReservationButton(reservation.reservation_id) : handleStartReservationButton(reservation.reservation_id)}
                                                                >
                                                                    {reservation.isCurrentlyRunning ? "End" : "Start"}
                                                                </Button>
                                                                {!reservation.isCurrentlyRunning && (
                                                                    <>
                                                                        <Button className="mr-2" variant={"constructive"} onClick={() => handleEditButton(reservation.reservation_id)}>
                                                                            <Pencil1Icon />
                                                                        </Button>
                                                                        <Popover open={confirmPopover === reservation.reservation_id} onOpenChange={(open) => !open && cancelDelete()}>
                                                                            <PopoverTrigger asChild>
                                                                                <Button className="mr-2" variant={"destructive"} onClick={() => handleDeleteClick(reservation.reservation_id)}>
                                                                                    <TrashIcon />
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="p-4 bg-white shadow border border-solid rounded-lg">
                                                                                <h3 className="text-lg font-semibold">Are you sure?</h3>
                                                                                <p>Do you really want to delete this reservation?</p>
                                                                                <div className="flex justify-end space-x-2 mt-4">
                                                                                    <Button variant="outline" onClick={cancelDelete}>Cancel</Button>
                                                                                    <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                                                                                </div>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <p>Reservation has finished.</p>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {error && (
                            <div className="flex justify-center">
                                <div className="text-center text-red-500 bg-red-100 border border-red-400 rounded-md py-2 px-4 mt-4">
                                    {error}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CardWrapper>
    );
};
