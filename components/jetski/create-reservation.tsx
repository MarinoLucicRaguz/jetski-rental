"use client"

import * as z from "zod";
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useEffect, useState, useTransition } from "react";
import { JetskiReservationSchema } from "@/schemas";
import {Form,FormControl,FormField,FormItem,FormLabel, FormMessage} from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper"
import { Button } from "../ui/button";
import { format,add } from "date-fns"
import { Calendar } from "../ui/calendar";
import { Popover,PopoverContent,PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Jetski, Location, RentalOptions } from "@prisma/client";
import { createReservation } from "@/actions/createReservation";
import { listAvailableJetskis } from "@/actions/listAvailableJetskis";
import { listLocation } from "@/actions/listLocations";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { getAvailableReservationOptions } from "@/actions/listAvailableRentalOptions";
import { PhoneInput } from 'react-international-phone'
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import ErrorPopup from "../ui/errorpopup";
import { debounce } from "lodash";
import 'react-international-phone/style.css';

export const JetSkiReservationForm =() => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const [rentalOptions, setRentalOptions] = useState<RentalOptions[] | null>([])
    const [selectedRentalOption, setRentalOption] = useState<RentalOptions>()

    const [phone, setPhone] = useState('');
    const [discount, setDiscount] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    const [rentDate,setRentDate] = useState<Date>()
    const [startTime, setStartTime] = useState<Date>(); 
    const [endTime, setEndTime] = useState<Date>();

    const [availableJetskis, setAvailableJetskis]=useState<Jetski[]>([]);
    const [selectedJetski, setSelectedJetski] = useState<Jetski[]>([]);

    const [availableLocations, setAvailableLocations] = useState<Location[] | null>([]);
    const [selectedLocation, setSelectedLocation] = useState<Location>();

    const [showError, setShowError] = useState(false);
    const router = useRouter();

    const user = useCurrentUser();
    
    const form = useForm<z.infer<typeof JetskiReservationSchema>>({
        resolver: zodResolver(JetskiReservationSchema),
        defaultValues:{
            rentDate: rentDate,
            startTime: startTime,
            endTime: endTime,
            reservation_location_id: selectedLocation?.location_id,
            reservation_jetski_list: selectedJetski,
            contactNumber: phone,
            totalPrice: totalPrice,
            rentaloption_id: selectedRentalOption?.rentaloption_id,
            discount: discount
        },
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const rentalData = await getAvailableReservationOptions();
                setRentalOptions(rentalData);
                const locationData = await listLocation();
                setAvailableLocations(locationData);

            } catch (error) {
                setError("Error fetching rental data");
            }
        };
        fetchData();
    }, []);    
    
    useEffect(() => {
        form.setValue("reservation_jetski_list", selectedJetski);
    }, [selectedJetski]);
        
    useEffect(() => {
        if (rentDate && startTime) {
            const adjustedStartTime = new Date(
                rentDate.getFullYear(),
                rentDate.getMonth(),
                rentDate.getDate(),
                startTime.getHours(),
                startTime.getMinutes()
            );
            setStartTime(adjustedStartTime);
            updateEndTime(adjustedStartTime);
        }
    }, [rentDate]);

    useEffect(() => {
        if (startTime && selectedRentalOption) {
            const endTimeDate = add(startTime, { minutes: selectedRentalOption.duration });
            setEndTime(endTimeDate);
            form.setValue('endTime', endTimeDate);
        }
    }, [startTime, selectedRentalOption]);

    useEffect(() => {
        const fetchJetskis = async () => {
            if (startTime && selectedRentalOption && endTime){
                try {
                    const data = await listAvailableJetskis(startTime, endTime);
                    setAvailableJetskis(data);
                } catch (error) {
                    setError("Error fetching jetskis");
                }
            }
        };
    
        fetchJetskis();
    }, [startTime, selectedRentalOption, endTime]);    

    useEffect(() => {
        form.setValue("discount", discount);
    }, [discount]);
    
    useEffect(() => {
        let jetskiAmplifier = selectedRentalOption?.rentaloption_description === "SAFARI" ? selectedJetski.length - 1 : selectedJetski.length;
    
        if (jetskiAmplifier <= 0) {
            jetskiAmplifier = 1;
        }
    
        if (selectedRentalOption) {
            const basePrice = selectedRentalOption.rentalprice * jetskiAmplifier;
            setTotalPrice(basePrice);
            form.setValue("totalPrice", basePrice);
        }
    }, [selectedRentalOption, selectedJetski]);
    

    useEffect(() => {
        if (user && user.role !== "ADMIN" && user.role !== "MODERATOR") {
          setShowError(true);
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        }
      }, [user, router]);
      
      if (user && user.role !== "ADMIN" && user.role !== "MODERATOR") {
        return (
          <>
            {showError && (
              <ErrorPopup
                message="You need to be an administrator or manager to view this page."
                onClose={() => setShowError(false)}
              />
            )}
          </>
        );
    }
    const debounceTimeChange = debounce((handler, value) => handler(value), 300);

    const handleRentDateTimeChange = (selectedRentDate: Date) => {
        setRentDate(selectedRentDate);
        if (startTime) {
            const updatedStartTime = new Date(
                selectedRentDate.getFullYear(),
                selectedRentDate.getMonth(),
                selectedRentDate.getDate(),
                startTime.getHours(),
                startTime.getMinutes()
            );
            debounceTimeChange(setStartTime, updatedStartTime);
            debounceTimeChange(updateEndTime, updatedStartTime);        }
    };
    
    const handleStartTimeChange = (selectedTime: Date | null) => {
        if (rentDate && selectedTime && !isNaN(selectedTime.getTime())) {
            const updatedStartTime = new Date(
                rentDate.getFullYear(),
                rentDate.getMonth(),
                rentDate.getDate(),
                selectedTime.getHours(),
                selectedTime.getMinutes()
            );
            console.log(updatedStartTime)
            setStartTime(updatedStartTime);
            updateEndTime(updatedStartTime);
        } else {
            console.log("Rent date is not set or invalid time. Please select the rent date first.");
        }
    };    
    
    const handleCheckboxChange = (jetski: Jetski, isChecked: boolean) => {
        setSelectedJetski(prevSelectedJetski => 
            isChecked 
            ? [...prevSelectedJetski, jetski]
            : prevSelectedJetski.filter(j => j.jetski_id !== jetski.jetski_id)
        );
    };

    const updateEndTime = (startDateTime:Date) => {
        if (selectedRentalOption) {
            const endTimeDate = add(startDateTime, { minutes: selectedRentalOption.duration });
            setEndTime(endTimeDate);
            form.setValue('endTime', endTimeDate);
        }
    };

    const onSubmit = async (values: z.infer<typeof JetskiReservationSchema>) => {
        console.log("Form submitted with values:", values);
        setError("");
        setSuccess("");
    
        startTransition(async () => {
            try {
                const data = await createReservation(values);
                console.log("Response from createReservation:", data);
                if (data.error) {
                    setError(data.error);
                } else {
                    setSuccess(data.success);
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500)
                }
            } catch (error) {
                setError("An error occurred while submitting the form.");
                console.error(error);
            }
        });
    }; 
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CardWrapper headerLabel="Add a reservation" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
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
                                            }}
                                        disabled={(date) =>
                                            date < new Date(new Date().toDateString()) 
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        </FormItem>
                    )}/> 
                    <FormField control={form.control} name="startTime" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Time of reservation</FormLabel>
                            <TimePicker
                                label="Select a time"
                                minTime={new Date(new Date().setHours(7, 0))}
                                maxTime={new Date(new Date().setHours(19, 30))}
                                skipDisabled={true}
                                value={startTime ||null}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        field.onChange(newValue);
                                        handleStartTimeChange(newValue);
                                    }
                                }}
                                views={['hours', 'minutes']}
                                ampm={false}
                                disabled={!rentDate}
                            />
                        </FormItem>
                    )} />
                    <div>
                    <input type="hidden" {...form.register("startTime")} value={startTime instanceof Date ? startTime.toISOString() : ''} />
                    <FormField name="reservation_location_id" render={({field})=>(
                        <FormItem className="flex justify-between">
                            <FormLabel className="text-lg font-bold">
                                Location of reservation: 
                            </FormLabel>
                            <FormControl className="w-60 bg-black text-white rounded-sm text-center border-solid p-1">
                                <select
                                    value={selectedLocation ? selectedLocation.location_id : ''}
                                    onChange={(event) => {
                                        const selectedLocationId = event.target.value;
                                        if (availableLocations) {
                                            const selectedLocation = availableLocations.find(location => location.location_id.toString() === selectedLocationId);
                                            setSelectedLocation(selectedLocation);
                                            form.setValue("reservation_location_id", selectedLocationId !== '' ? Number(selectedLocationId) : 0);
                                            console.log(selectedLocationId);
                                        }
                                    }}
                                >
                                    <option value="">Select a location!</option>
                                    {user && user.role!=="ADMIN" &&user?.location_id ? (
                                        <option value={user.location_id}>
                                            {availableLocations && availableLocations.find(location => location.location_id === user.location_id)?.location_name}
                                        </option>
                                    ) : (
                                        availableLocations && availableLocations.map(location => (
                                            <option key={location.location_id} value={location.location_id}>
                                                {location.location_name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </FormControl>
                        </FormItem>
                    )}/>
                    </div>
                    <div className="justify-between flex">
                        <strong>Rental option: </strong>
                        <FormControl className="w-80 bg-black text-white rounded-sm text-center border-solid p-1">
                        <select
                            value={selectedRentalOption?.rentaloption_id || ''}
                            onChange={(event) => {
                                const selectedId = parseInt(event.target.value);
                                const selectedOption = rentalOptions?.find(option => option.rentaloption_id === selectedId);
                                setRentalOption(selectedOption || undefined);
                                form.setValue("rentaloption_id", selectedId);
                            }}
                            disabled={!rentDate}
                        >
                            <option value="">Select a rental option!</option>
                            {rentalOptions?.map((option) => (
                                <option key={option.rentaloption_id} value={option.rentaloption_id.toString()}>
                                    {option.rentaloption_description} - {option.duration} minutes - {option.rentalprice} €
                                </option>
                            ))}
                        </select>
                        </FormControl>
                    </div>
                    <input type="hidden" {...form.register("rentaloption_id")} value={selectedRentalOption?.rentaloption_id } />
                    <div className="flex justify-between">
                        <strong>Reservation until:</strong>
                        {endTime instanceof Date && (
                            <span className="bg-black text-white w-40 text-center">{format(endTime, "HH:mm")}</span>
                        )}
                        <input type="hidden" {...form.register("endTime")} value={endTime instanceof Date ? endTime.toISOString() : ''} />
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
                                            {" " + jetski.jetski_registration + " - " + (availableLocations?.find(loc => loc.location_id===jetski.jetski_location_id)?.location_name || "No location")}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </FormControl>
                    </div>
                    <input type="hidden" {...form.register("reservation_jetski_list")} value={JSON.stringify(selectedJetski)} />
                    <div>
                    <FormField control={form.control} name="reservationOwner"
                        render={({ field }) => (
                            <FormItem>
                            <strong> 
                            Reservation owner
                            </strong>
                                <FormControl>
                                <Input
                                    {...field}
                                    disabled={isPending}
                                    placeholder="Owner of reservation"
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                    />
                    </div>
                    <div className="flex-xol justify-between ">
                        <strong> Contact number: </strong>
                        <Controller
                            control={form.control}
                            name="contactNumber"
                            render={({ field, fieldState: { error } }) => (
                                <div className="w-full">
                                    <PhoneInput
                                        {...field}
                                        defaultCountry="hr"
                                        autoFocus={true}
                                        onChange={(value) => {
                                        setPhone(value);
                                        field.onChange(value);
                                        }}
                                        value={phone}
                                        className={error ? "border-red-500" : ""}
                                    />
                                    {error && <span className="text-red-500">{error.message}</span>}
                                </div>
                            )}
                            />
                    </div>
                    <input type="hidden" {...form.register("contactNumber")} value={phone} />
                    <div className="flex justify-between">
                        <strong>Discount:</strong>
                        <FormControl className="w-20 bg-black text-white rounded-sm text-center border-solid p-1">
                            <select
                                value={discount}
                                onChange={(e) => setDiscount(parseInt(e.target.value))}
                                className="form-control"
                                >
                                {[0, 5, 10, 15, 20].map(value => (
                                    <option key={value} value={value}>{value}%</option>
                                ))}
                            </select>
                        </FormControl>
                    </div>
                    <input type="hidden" {...form.register("discount")} value={discount} />
                    <div className="flex justify-between">
                        <strong>Total Price:</strong>
                        <span>{(totalPrice * (1 - discount / 100)).toFixed(2)} €</span>
                    </div>
                    <FormError message={error}/>
                    <FormSuccess message={success}/>
                    <Button type="submit" className="w-full">
                        Confirm the reservation!
                    </Button>
                </form>
            </Form>
        </CardWrapper>   
        </LocalizationProvider>
    )
}

