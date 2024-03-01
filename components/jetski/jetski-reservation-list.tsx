"use client";

import { useEffect, useState } from "react";
import { CardWrapper } from "../auth/card-wrapper";
import { getAllReservations } from "@/actions/listReservations";
import { Reservation } from "@/data/jetski";
import { listReservationsByDate } from "@/actions/listReservationsForDate";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "../ui/button";
import { CalendarIcon } from "@radix-ui/react-icons";
import { PopoverContent } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns"
import { Link } from 'react-router-dom';

export const ListReservations = () => {
    const [error, setError] = useState<string | undefined>("");
    const [reservationData, setReservationData] = useState<Reservation[] | null>([]);
    const [rentDate,setRentDate] = useState<Date>(new Date())

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await listReservationsByDate(rentDate);
                if(data)
                    data.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
                setReservationData(data);
            } catch (error) {
                setError("Error fetching reservations");
            }
        };
        
        fetchData();
    }, [rentDate]);


    return (
            <div className="bg-white rounded-md text-center">
                <div className="p-6">
                    <h2 className="text-lg font-semibold flex">RESERVATION SCHEDULE</h2>
                    <a href="/dashboard" className="text-blue-500 font-bold flex">Back to Dashboard</a>
                    <span className="text-lg font-semibold p-6 ">Date of reservation</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"}>
                                {rentDate ? (
                                    format(rentDate, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 " align="start">
                            <Calendar
                                mode="single"
                                selected={rentDate}
                                onSelect={(date) => {
                                    if (date) setRentDate(date);
                                    console.log("Selected date:", date);
                                }}
                                disabled={(date) => date < new Date(new Date().toDateString())}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex flex-wrap justify-start space-x-4 p-4">
                    {reservationData?.map((reservation) => (
                        <div key={reservation.reservation_id} className="flex flex-col border border-black rounded-md text-l w-80">
                            <div className="border border-gray-200 rounded p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <strong>Start Time: {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</strong>
                                    <strong>End Time: {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</strong>
                                </div>
                                <div className="mr-2 mb-2 flex"><b>Location: </b>
                                    <div>
                                        {reservation.reservation_location.location_name}
                                    </div>
                                </div>
                                <div className="mr-2 mb-2 flex"><b>Safari Tour: </b>
                                    {reservation.safariTour ? "Yes" : "No"}
                                </div>
                                <div className="flex flex-wrap">
                                    <strong className="mr-2 mb-2">Jetski: </strong>
                                    <div>
                                        {reservation.reservation_jetski_list && reservation.reservation_jetski_list.map((jetski) => (
                                            <div key={jetski.jetski_id}>
                                                <span>{jetski.jetski_registration}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
};
