"use client"

import * as z from "zod";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useEffect, useState, useTransition } from "react";
import { JetskiReservationSchema } from "@/schemas";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper"
import { Button } from "../ui/button";
import { DateTime, Duration } from "luxon"
import { format,add } from "date-fns"
import { Calendar } from "../ui/calendar";
import { Popover,PopoverContent,PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Jetski, Location, Reservation } from "@prisma/client";
import { createReservation } from "@/actions/createReservation";
import { listAvailableJetskis } from "@/actions/listAvailableJetskis";
import { listLocation } from "@/actions/listLocations";

enum RentDuration {
    "20 minutes" = "20 minutes",
    "30 minutes" = "30 minutes",
    "45 minutes" = "45 minutes",
    "1 hour" = "1 hour",
    "1 hour 30 minutes" = "1 hour 30 minutes",
    "2 hours" = "2 hours",
    "3 hours" = "3 hours",
}

function getDurationInMinutes(duration: RentDuration): number {
    switch (duration) {
        case RentDuration["20 minutes"]:
            return 20;
        case RentDuration["30 minutes"]:
            return 30;
        case RentDuration["45 minutes"]:
            return 45;
        case RentDuration["1 hour"]:
            return 60;
        case RentDuration["1 hour 30 minutes"]:
            return 90;
        case RentDuration["2 hours"]:
            return 120;
        case RentDuration["3 hours"]:
            return 180;
        default:
            throw new Error("Invalid rental duration"); //Should absolutely never happen
    }
}

function calculateEndTime(startTime: DateTime, duration: RentDuration): Date {
    const minutes = getDurationInMinutes(duration);
    return startTime.plus({ minutes }).toJSDate();
}

export const JetSkiReservationForm =() => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const [duration, setDuration] = useState<RentDuration>(RentDuration["20 minutes"]);

    const [rentDate,setRentDate] = useState<Date>()
    const [startTime, setStartTime] = useState<Date>(); 
    const [endTime, setEndTime] = useState<Date>(calculateEndTime(DateTime.now(), duration));
    const [availableJetskis, setAvailableJetskis]=useState<Jetski[]>([]);
    const [selectedJetski, setSelectedJetski] = useState<Jetski[]>([]);
    const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<Location>();
    const [safariTour, setSafariTour] = useState<string>(""); 

    const handleStartTimeChange = (selectedStartTime: Date) => {
        setStartTime(selectedStartTime);
    };

    const handleRentDateTimeChange = (selectedRentDate: Date)=>{
        setRentDate(selectedRentDate);
    };
    
    useEffect(() => {
        const getListLocation = async () => {
            try {
                const data = await listLocation();
                if(data)
                    {
                        setAvailableLocations(data);
                    }
                } catch (error) {
                setError("Error fetching locations");
            }
        };

        getListLocation();
    },[]);


    const handleCheckboxChange = (jetski: Jetski, isChecked: boolean) => {
        if (isChecked) {
            setSelectedJetski([...selectedJetski, jetski]);
        } else {
            setSelectedJetski(selectedJetski.filter(j => j.jetski_id !== jetski.jetski_id));
        }
    };
    

    useEffect(() => {
        const fetchJetskis = async () => {
            if (startTime && duration){
                try {
                    const data = await listAvailableJetskis(startTime,endTime);
                    setAvailableJetskis(data);
                } catch (error) {
                    setError("Error fetching locations");
                }
            }
        };

        fetchJetskis();
    },[startTime,duration]);

    useEffect(() => {
        if (startTime && duration) {
            const calculatedEndTime = calculateEndTime(DateTime.fromJSDate(startTime), duration);
            setEndTime(calculatedEndTime);
        }
    }, [startTime, duration]);

    useEffect(() => {
        form.setValue("reservation_jetski_list", selectedJetski);
        form.setValue("jetSkiCount",selectedJetski.length);
        console.log("Selected jetskis: ", selectedJetski);
        console.log(selectedJetski.length)
        console.log(selectedLocation)
        console.log(safariTour)
    }, [selectedJetski]);
    

    const form = useForm<z.infer<typeof JetskiReservationSchema>>({
        resolver: zodResolver(JetskiReservationSchema),
        defaultValues:{
            rentDate: rentDate,
            startTime: startTime,
            endTime: endTime,
            jetSkiCount: selectedJetski.length,
            safariTour: safariTour,
            reservation_location_id: selectedLocation?.location_id,
            reservation_jetski_list: selectedJetski,
        },
    })

    const getTimes = () => {
        if (!rentDate) return [];
    
        const today = new Date();
        const beginning = new Date(rentDate);
        beginning.setHours(8, 0, 0, 0);
    
        const end = new Date(rentDate);
        end.setHours(21, 0, 0, 0);
    
        const interval = 5;
        const times = [];
    
        for (let i = beginning; i <= end; i = add(i, { minutes: interval })) {
            times.push(i);
        }
    
        return times;
    };
    
    const times = getTimes()

    const onSubmit = (values: z.infer<typeof JetskiReservationSchema>) => {
        setError("");
        setSuccess("");
    
        console.log("Submitting form with values:", values); // Add this line
    
        startTransition(() => {
            createReservation(values)
                .then((data) => {
                    console.log("Response from createReservation:", data); // Add this line
                    setError(data.error);
                    setSuccess(data.success);
                    window.location.reload();
                })
                .catch((error) => {
                    setError("An error occurred while submitting the form.");
                    console.error(error);
                });
        });
    };

    return (
        <CardWrapper headerLabel="Create a reservation" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
                    <FormField control={form.control} name="rentDate" render={({field})=>(
                        <FormItem className="flex flex-col">
                            <FormLabel>Date of reservation</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"}>
                                            {field.value ? (
                                                format(field.value, "PPP")
                                                    ) : (
                                            <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                            field.onChange(date);
                                            if(date)
                                                handleRentDateTimeChange(date);
                                            console.log("Selected date:", date) }}
                                        disabled={(date) =>
                                            date < new Date(new Date().toDateString()) 
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        </FormItem>
                    )}/> 
                    <FormField control={form.control} name="startTime" render={({field})=>(
                    <FormItem className="flex flex-col">
                    <FormLabel>
                        Time of reservation
                    </FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"}>
                                    {field.value ? (
                                        format(field.value, "HH:mm")
                                    ) : (
                                        <span>Pick a time</span>
                                    )}
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 max-h-60 overflow-y-auto" align="start">
                            <div className="grid grid-cols-4 gap-4">
                                {times.map((time, index) => (
                                    <Button
                                        key={index}
                                        onClick={() => {
                                            field.onChange(time); 
                                            handleStartTimeChange(time); //ovako mozes pullat dostupne jetskije
                                            console.log("Selected time:", format(time, "HH:mm"));
                                        }}
                                        className="m-1"
                                        variant={field.value && field.value.getTime() === time.getTime() ? "default" : "outline"}
                                    >
                                        {format(time, "HH:mm")}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                    </FormItem>
                    )}/>
                    <div className="justify-between flex">
                        <strong>Duration of rental: </strong>
                        <FormControl className="w-40 bg-black text-white rounded-sm text-center border-solid p-1">
                            <select value={duration} onChange={(event) => {
                                const selectedDuration = event.target.value as RentDuration;
                                setDuration(selectedDuration);
                                // Calculate and set the endTime based on the selected duration
                                if (startTime) {
                                    const calculatedEndTime = calculateEndTime(DateTime.fromJSDate(startTime), selectedDuration);
                                    setEndTime(calculatedEndTime);
                                    // Update the hidden input field value
                                    form.setValue("endTime", calculatedEndTime);
                                }
                            }}>
                                {Object.entries(RentDuration).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </FormControl>
                    </div>
                    <div className="flex justify-between">
                        <strong>Reservation until:</strong>
                        {endTime && (
                            <span className="bg-black text-white w-40 text-center">{format(endTime, "HH:mm")}</span>
                        )}
                        <input type="hidden" {...form.register("endTime")} value={endTime?.toISOString()} />
                    </div>
                    <div>
                        <strong>Choose jetskis:</strong>
                        <FormControl className="rounded-sm border-solid p-1 flex-col justify-between">
                            <div>
                                {availableJetskis.map((jetski) => (
                                    <div key={jetski.jetski_id} className="block">
                                        <label style={{ fontWeight: 'bold', fontFamily: 'TimesNewRoman'}}>
                                            <input
                                                type="checkbox"
                                                onChange={(e) => handleCheckboxChange(jetski, e.target.checked)}
                                            />
                                            {" " + jetski.jetski_registration}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </FormControl>
                    </div>
                    <input type="hidden" {...form.register("reservation_jetski_list")} value={JSON.stringify(selectedJetski)} />
                    <input type="hidden" {...form.register("jetSkiCount")} value={selectedJetski.length} />
                    <FormField name="safariTour" render={({field})=>(
                            <FormItem className="flex justify-between items-center">
                                <FormLabel className="text-sm font-bold">Is it Safari Tour: </FormLabel>
                                <FormControl className="w-40 bg-black text-white text-center rounded-mb border-solid">
                                    <select {...field} value={field.value ?? '' } className="w-full bg-black text-white text-center rounded-md border-solid" onChange={(event)=>{
                                        const selectedValue = event.target.value;
                                        setSafariTour(selectedValue);
                                        field.onChange(selectedValue);
                                    }}>
                                        <option value="no" >
                                            No
                                        </option>
                                        <option value="yes" >
                                            Yes
                                        </option>
                                    </select>
                                </FormControl>
                            </FormItem>
                    )}/>
                    <div>
                    <FormField name="reservation_location_id" render={({field})=>(
                        <FormItem className="flex justify-between">
                            <FormLabel className="text-sm font-bold">
                                Location of reservation: 
                            </FormLabel>
                            <FormControl className="w-40 bg-black text-white rounded-sm text-center border-solid p-1">
                                <select value={selectedLocation ? selectedLocation.location_id : ''} onChange={(event) => {
                                    const selectedLocationId = event.target.value;
                                    const selectedLocation = availableLocations.find(location => location.location_id.toString() === selectedLocationId);
                                    setSelectedLocation(selectedLocation);
                                    form.setValue("reservation_location_id", selectedLocationId !== '' ? Number(selectedLocationId) : 0);
                                }}>
                                    <option value="">Select a location</option>
                                    {availableLocations && availableLocations.map(location => (
                                        <option key={location.location_id} value={location.location_id}>
                                            {location.location_name}
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                        </FormItem>
                    )}/>
                    </div>
                    <Button type="submit" className="w-full">
                        Confirm the reservation!
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}

