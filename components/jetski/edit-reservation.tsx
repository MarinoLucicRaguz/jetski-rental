"use client"

import * as z from "zod";
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState, useTransition } from "react";
import { EditReservationSchema, JetskiReservationSchema } from "@/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper"
import { Button } from "../ui/button";
import { format, add } from "date-fns"
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Jetski, Location, RentalOptions, Reservation } from "@prisma/client";
import { listAvailableJetskis } from "@/actions/listAvailableJetskis";
import { listLocation } from "@/actions/listLocations";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { getAvailableReservationOptions } from "@/actions/listAvailableRentalOptions";
import { PhoneInput } from 'react-international-phone'
import { getReservationData } from "@/actions/getReservationData";
import 'react-international-phone/style.css';
import { Input } from "../ui/input";
import { editReservation } from "@/actions/editReservation";
import { ExtendedReservation } from "@/types";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import ErrorPopup from "../ui/errorpopup";
import { DateTime } from "luxon";


export const EditJetSkiReservationForm = ({ reservationId }: { reservationId: number }) => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const [currentReservation, setCurrentReservation] = useState<Reservation & { reservation_jetski_list: Jetski[] } | null>(null);

    const [rentalOptions, setRentalOptions] = useState<RentalOptions[] | null>([]);
    const [selectedRentalOption, setRentalOption] = useState<RentalOptions | undefined>();

    const [phone, setPhone] = useState('');
    const [discount, setDiscount] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [rentDate, setRentDate] = useState<Date | undefined>(undefined);
    const [startTime, setStartTime] = useState<Date | undefined>(undefined);
    const [endTime, setEndTime] = useState<Date | undefined>(undefined);
    const [availableJetskis, setAvailableJetskis] = useState<Jetski[]>([]);
    const [selectedJetski, setSelectedJetski] = useState<Jetski[]>([]);
    const [availableLocations, setAvailableLocations] = useState<Location[] | null>([]);
    const [selectedLocation, setSelectedLocation] = useState<Location>();

    const [showError, setShowError] = useState(false);
    const router = useRouter();

    const user = useCurrentUser();

    useEffect(() => {
        if (user && user.role !== "ADMIN" && user.role !== "MODERATOR") {
          setShowError(true);
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        }
      }, [user, router]);
    
    const form = useForm<z.infer<typeof EditReservationSchema>>({
        resolver: zodResolver(EditReservationSchema),
        defaultValues: {
            reservation_id: reservationId,
            rentDate: rentDate,
            startTime: startTime,
            endTime: endTime,
            reservation_location_id: selectedLocation?.location_id,
            reservation_jetski_list: selectedJetski,
            contactNumber: phone,
            totalPrice: totalPrice,
            rentaloption_id: selectedRentalOption?.rentaloption_id,
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rentalData, locationData, currentReservationData] = await Promise.all([
                    getAvailableReservationOptions(),
                    listLocation(),
                    getReservationData(reservationId)
                ]);
    
                setRentalOptions(rentalData);
                setAvailableLocations(locationData);
                setCurrentReservation(currentReservationData);
                if (currentReservationData && rentalData && locationData) {
                    const rentalOpt = rentalData.find(option => option.rentaloption_id === currentReservationData.rentaloption_id);
                    setRentalOption(rentalOpt);
    
                    const locationOpt = locationData.find(option => option.location_id === currentReservationData.reservation_location_id);
                    setSelectedLocation(locationOpt);
    
                    setReservationData(currentReservationData, rentalData, locationData);
                }
                      
            } catch (error) {
                setError("Error fetching rental data or reservation data");
                console.error("Failed to fetch data: ", error);
            }
        };
        fetchData();
    }, [reservationId]);

    useEffect(() => {
        if (selectedRentalOption && startTime) {
            updateEndTime(startTime, selectedRentalOption);
        }
    }, [selectedRentalOption]);
    
    useEffect(() => {
        form.setValue("reservation_jetski_list", selectedJetski);
    }, [selectedJetski]);


    useEffect(() => {
        const fetchJetskis = async () => {
            if (startTime && selectedRentalOption && endTime && currentReservation) {
                try {
                    const data = await listAvailableJetskis(startTime, endTime);
                    const currentJetskis = currentReservation.reservation_jetski_list || [];

                    const newStartTime = startTime;
                    const newEndTime = endTime;

                    const isOverlap = (newStartTime <= currentReservation.endTime) && (newEndTime >= currentReservation.startTime);

                    if (isOverlap) {
                        const mergedJetskis = [
                            ...data,
                            ...currentJetskis.filter(jetski =>
                                !data.some(availableJetski => availableJetski.jetski_id === jetski.jetski_id)
                            )
                        ];
                        setAvailableJetskis(mergedJetskis);
                        setSelectedJetski(currentJetskis)
                    } else {
                        setAvailableJetskis(data);
                    }
                } catch (error) {
                    setError("Error fetching jetskis");
                    console.error("Error fetching jetskis: ", error);
                }
            }
        };

        fetchJetskis();
    }, [startTime, selectedRentalOption, endTime, currentReservation]);
    
    useEffect(()=>{
        if (startTime && selectedRentalOption && endTime)
        {
            setSelectedJetski([]);
        }
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

    if (user && user.role !== "ADMIN" && user.role !== "MODERATOR") {
        return (
          <>
            {showError && (
              <ErrorPopup
                message="You need to be an administrator to view this page."
                onClose={() => setShowError(false)}
              />
            )}
          </>
        );
    }

    const setReservationData = (reservationData: ExtendedReservation, rentalData: RentalOptions[], locationData: Location[]) =>{
        const locationOpt = availableLocations?.find(option => option.location_id===reservationData.reservation_location_id);
        setSelectedLocation(locationOpt);
        
        const rentalOpt = rentalData?.find(option => option.rentaloption_id===reservationData.rentaloption_id);
        setRentalOption(rentalOpt);
        
        setRentDate(new Date(reservationData.startTime.getFullYear(), reservationData.startTime.getMonth(), reservationData.startTime.getDate()));
        setStartTime(reservationData.startTime);
        setEndTime(reservationData.endTime);
        setPhone(reservationData.contactNumber);
        setSelectedJetski(reservationData.reservation_jetski_list)
        setDiscount(reservationData.discount);

        form.setValue("rentDate", reservationData.startTime);
        form.setValue("startTime", reservationData.startTime);
        form.setValue("endTime", reservationData.endTime);
        form.setValue("discount", reservationData.discount);
        form.setValue("rentaloption_id", rentalOpt?.rentaloption_id || 0);
        form.setValue("reservation_location_id", reservationData.reservation_location_id);
        form.setValue("reservationOwner", reservationData.reservationOwner);
        form.setValue("contactNumber", reservationData.contactNumber);
        form.setValue("reservation_jetski_list", reservationData.reservation_jetski_list);
    }

    const handleRentDateTimeChange = (selectedRentDate: Date | undefined) => {
        if (selectedRentDate && startTime && selectedRentalOption) {
            setRentDate(selectedRentDate);
            const updatedStartTime = new Date(
                    selectedRentDate.getFullYear(),
                    selectedRentDate.getMonth(),
                    selectedRentDate.getDate(),
                    startTime.getHours(),
                    startTime.getMinutes()
                );
            setStartTime(updatedStartTime);
            updateEndTime(updatedStartTime, selectedRentalOption);
            setSelectedJetski([]);
        }else {
            console.log("There has been an issue with fetching data when changing date.");
        }
    };

    const handleStartTimeChange = (selectedTime: Date | null) => {
        if (rentDate && selectedTime && selectedRentalOption) {
            const updatedStartTime = new Date(
                rentDate.getFullYear(),
                rentDate.getMonth(),
                rentDate.getDate(),
                selectedTime.getHours(),
                selectedTime.getMinutes()
            );
            setStartTime(updatedStartTime);
            updateEndTime(updatedStartTime, selectedRentalOption);
            setSelectedJetski([]); 
        } else {
            console.log(selectedRentalOption)
            console.log("Rent date is not set. Please select the rent date first.");
        }
    };

    const updateEndTime = (startDateTime: Date, rentalOption: RentalOptions) => {
        const endTimeDate = add(startDateTime, { minutes: rentalOption.duration });
        setEndTime(endTimeDate);
        form.setValue('endTime', endTimeDate);
    };

    const handleCheckboxChange = (jetski: Jetski, isChecked: boolean) => {
        setSelectedJetski(prevSelectedJetski =>
            isChecked
                ? [...prevSelectedJetski, jetski]
                : prevSelectedJetski.filter(j => j.jetski_id !== jetski.jetski_id)
        );
    };

    const onSubmit = async (values: z.infer<typeof EditReservationSchema>) => {
        console.log("Form submitted with values:", values);
        const updatedRentDate = DateTime.fromJSDate(values.rentDate)
            .plus({ hours: 3 })
            .toJSDate();

        values.rentDate = updatedRentDate;
        setError("");
        setSuccess("");

        startTransition(async () => {
            try {
                const data = await editReservation(values);
                console.log("Response from edit reservation:", data);
                if (data.error) {
                    setError(data.error);
                } else {
                    setSuccess(data.success);
                }
            } catch (error) {
                setError("An error occurred while submitting the form.");
                console.error(error);
            }
        });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CardWrapper headerLabel="Edit a reservation" backButtonLabel="Go back to reservation list" backButtonHref="/reservation/listreservation">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField control={form.control} name="rentDate" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date of reservation</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"}>
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    currentReservation?.startTime ? format(new Date(currentReservation.startTime), "PPP") : "Pick a date"
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(date) => {
                                                field.onChange(date);
                                                handleRentDateTimeChange(date);
                                                console.log("Selected date:", date);
                                            }}
                                            disabled={(date) =>
                                                date < new Date(new Date().toDateString())
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="startTime" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Time of reservation</FormLabel>
                                <TimePicker
                                    label="Select a time"
                                    minTime={new Date(new Date().setHours(7, 0))}
                                    maxTime={new Date(new Date().setHours(19, 30))}
                                    skipDisabled={true}
                                    value={startTime ?? new Date(new Date().setHours(7, 0))}
                                    onChange={(newValue) => {
                                        field.onChange(newValue);
                                        handleStartTimeChange(newValue);
                                    }}
                                    views={['hours', 'minutes']}
                                    ampm={false}
                                />
                            </FormItem>
                        )} />
                        <div>
                        <input type="hidden" {...form.register("startTime")} value={startTime instanceof Date ? startTime.toISOString() : ''} />
                        <FormField name="reservation_location_id" render={({ field }) => (
                            <FormItem className="flex justify-between">
                                <FormLabel className="text-lg font-bold">
                                    Location of reservation:
                                </FormLabel>
                                <FormControl className="w-60 bg-black text-white rounded-sm text-center border-solid p-1">
                                    <select
                                        {...field}
                                        value={selectedLocation ? selectedLocation.location_id : ''}
                                        onChange={(event) => {
                                            const selectedLocationId = Number(event.target.value);
                                            const selectedLocation = availableLocations?.find(location => location.location_id === selectedLocationId);
                                            setSelectedLocation(selectedLocation || undefined);
                                            field.onChange(selectedLocationId);
                                        }}>
                                        {currentReservation && (
                                        <option value={currentReservation.reservation_location_id} selected>
                                            {availableLocations?.find(location => location.location_id === currentReservation.reservation_location_id)?.location_name}
                                        </option>
                                        )}
                                        {availableLocations && availableLocations
                                            .filter(location => location.location_id !== currentReservation?.reservation_location_id)
                                            .map(location => (
                                                <option key={location.location_id} value={location.location_id}>
                                                    {location.location_name}
                                                </option>
                                            ))}
                                    </select>
                                </FormControl>
                            </FormItem>
                        )} />
                        </div>
                        <div className="justify-between flex">
                            <strong>Rental option: </strong>
                            <FormControl className="w-80 bg-black text-white rounded-sm text-center border-solid p-1">
                                <select
                                    value={selectedRentalOption?.rentaloption_id || currentReservation?.rentaloption_id}
                                    onChange={(event) => {
                                        const selectedId = parseInt(event.target.value);
                                        const selectedOption = rentalOptions?.find(option => option.rentaloption_id === selectedId);
                                        setRentalOption(selectedOption || undefined);
                                    }}
                                >
                                {selectedRentalOption && (
                                    <option value={selectedRentalOption.rentaloption_id}>
                                        {selectedRentalOption.rentaloption_description} - {selectedRentalOption.duration} minutes - {selectedRentalOption.rentalprice} €
                                    </option>
                                )}
                                {rentalOptions && rentalOptions.map(option => (
                                    <option key={option.rentaloption_id} value={option.rentaloption_id}>
                                        {option.rentaloption_description} - {option.duration} minutes - {option.rentalprice} €
                                    </option>
                                ))}
                                </select>
                            </FormControl>
                        </div>
                        <input type="hidden" {...form.register("rentaloption_id")} value={selectedRentalOption?.rentaloption_id} />
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
                                            <label 
                                                style={{ 
                                                    fontWeight: 'bold', 
                                                    fontFamily: 'TimesNewRoman', 
                                                    color: jetski.jetski_status !== "AVAILABLE" ? 'red' : 'inherit' 
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => handleCheckboxChange(jetski, e.target.checked)}
                                                    checked={selectedJetski.some(selected => selected.jetski_id === jetski.jetski_id)}
                                                />
                                                {" " + jetski.jetski_registration + " - " + jetski.jetski_model + " - " + jetski.jetski_manufacturingYear + " - " + availableLocations?.find(loc => loc.location_id === jetski.jetski_location_id)?.location_name}
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
                                                value={field.value}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex justify-between w-full ">
                            <strong> Contact number: </strong>
                            <Controller
                                control={form.control}
                                name="contactNumber"
                                render={({ field }) => (
                                    <PhoneInput
                                        {...field}
                                        defaultCountry="hr"
                                        autoFocus={true}
                                        onChange={(value) => {
                                            setPhone(value);
                                            field.onChange(value);
                                        }}
                                        value={phone}
                                    />
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
                        <FormError message={error} />
                        <FormSuccess message={success} />
                        <Button type="submit" className="w-full">
                            Save
                        </Button>
                    </form>
                </Form>
            </CardWrapper>
        </LocalizationProvider>
    );
};
