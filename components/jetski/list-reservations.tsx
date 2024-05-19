"use client";

import { useEffect, useMemo, useState } from "react";
import { CardWrapper } from "../auth/card-wrapper";
import { listReservationsByDate } from "@/actions/listReservationsForDate";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { Button } from "../ui/button";
import { CalendarIcon, TrashIcon, UpdateIcon } from "@radix-ui/react-icons";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { Location, Reservation } from "@prisma/client";
import { listLocation } from "@/actions/listLocations";
import { Menu, MenuItem } from "@mui/material";
import { deleteReservation } from "@/actions/deleteReservation";
import { useRouter } from "next/navigation";
import { ExtendedReservation } from "@/types";

export const ListReservations = () => {
    const [error, setError] = useState("");
    const [reservationData, setReservationData] = useState<ExtendedReservation[]>([]);
    const [rentDate, setRentDate] = useState(new Date());
    const [locationNames, setLocationNames] = useState<Location[] | null>([]);
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [confirmPopover, setConfirmPopover] = useState<null | number>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const locationData = await listLocation();
                setLocationNames(locationData);
            } catch (error) {
                setError("Failed to load locations: " + error);
            }
        };
        fetchLocations();
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

    const filteredReservations = useMemo(() => {
        return reservationData.filter(reservation =>
            selectedLocation === null || reservation.reservation_location_id === selectedLocation
        );
    }, [reservationData, selectedLocation]);

    const handleEditButton = (reservationId: number) => {
        router.push(`/reservation/${reservationId}/editreservation`);
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

    const handleDeleteClick = (reservation_id: number) => {
        setConfirmPopover(reservation_id);
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

    return (
        <CardWrapper headerLabel="List of Reservations" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard" className="shadow-md md:w-[750px] lg:w-[1200px]">
            <div className="p-4 bg-white shadow rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Reservation Schedule</h2>
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
                                    if (date) setRentDate(date);
                                    console.log("Selected date:", date);
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                    <div className="flex justify-between">
                        <Button onClick={handleClick}>Filter</Button>
                        <Menu
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={() => handleLocationSelect(null)}>No filter</MenuItem>
                            {locationNames?.map((location) => (
                                <MenuItem key={location.location_id} onClick={() => handleLocationSelect(location.location_id)}>
                                    {location.location_name}
                                </MenuItem>
                            ))}
                        </Menu>
                    </div>
                </div>
                {error && <div className="text-red-500">{error}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReservations.map((reservation) => {
                        const location = locationNames?.find(loc => loc.location_id === reservation.reservation_location_id);
                        return (
                            <div key={reservation.reservation_id} className="border rounded-lg p-4 shadow-sm flex flex-col">
                                <div>
                                    <strong>Reservation name:</strong> {reservation.reservationOwner}
                                </div>
                                <div>
                                    <strong>Contact number: </strong> {reservation.contactNumber}
                                </div>
                                <div>
                                    <strong>Start Time:</strong> {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    <br />
                                    <strong>End Time:</strong> {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </div>
                                <div>
                                    <strong>Location:</strong> {location ? location.location_name : 'No location found'}
                                </div>
                                <div>
                                    <strong>Price: </strong> {reservation.totalPrice} €
                                </div>
                                <div>
                                    <strong>Jetski:</strong>
                                    {reservation.reservation_jetski_list && reservation.reservation_jetski_list.map(jetski => (
                                        <div key={jetski.jetski_id}>{jetski.jetski_registration}</div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-auto">
                                        <Button variant={"constructive"} onClick={()=> handleEditButton(reservation.reservation_id)}>
                                            <UpdateIcon />
                                        </Button>
                                    <Popover open={confirmPopover === reservation.reservation_id} onOpenChange={(open) => !open && cancelDelete()}>
                                        <PopoverTrigger asChild>
                                            <Button variant={"destructive"} onClick={() => handleDeleteClick(reservation.reservation_id)}>
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
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </CardWrapper>
    );
};
