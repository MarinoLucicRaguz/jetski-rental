"use client"

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { editLocation } from "@/actions/editLocation";
import { getLocationNameAction } from "@/actions/getLocationName";
import { LocationSchema } from "@/schemas";
import { Input } from "../ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";



export const EditLocationForm = ({locationId}: {locationId: number}) => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const [locationName, setLocationName] = useState<string>("");
    


    const form = useForm<z.infer<typeof LocationSchema>>({
        resolver: zodResolver(LocationSchema),
        defaultValues: {
            location_name: locationName,
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const name = await getLocationNameAction(locationId);
                if (name !== null && name !== undefined) { // Check if name is not null or undefined
                    setLocationName(name);
                }
            } catch (error) {
                console.error("Error fetching location name:", error);
            }
        };

        fetchData();
    }, []);

    const onSubmit = async (values: z.infer<typeof LocationSchema>) => {
        setError("");
        setSuccess("");

        try {
            const data = await editLocation(locationId, values);
            setError(data.error || "");
            setSuccess(data.success || "");
        } catch (error) {
            setError("An error occurred while editing the location");
        }
    };

    return (
        <CardWrapper headerLabel="Edit Location" backButtonLabel="Go back to location list" backButtonHref="/location/listlocation">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormField control={form.control} name="location_name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location Name</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} placeholder={locationName} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button type="submit" className="flex w-full margin-right-5" disabled={isPending}>Edit Location</Button>
                </form>
            </Form>
        </CardWrapper>
    );
};
