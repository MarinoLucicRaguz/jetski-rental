"use client"

import * as z from "zod";
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useEffect, useState, useTransition } from "react";
import { ReservationOptionSchema } from "@/schemas";
import { Input } from "../ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,

} from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper"
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { createReservationOption } from "@/actions/createReservationOption";
import { RentalOptions } from "@prisma/client";
import { getRentalOption } from "@/actions/getRentalOption";
import { editReservationOption } from "@/actions/editReservationOption";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import ErrorPopup from "../ui/errorpopup";


export const EditReservationOptionForm =({rentalOptionId}: {rentalOptionId: number}) => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const [currentRentalOptions, setCurrentRentalOptions] = useState<RentalOptions>();
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getRentalOption(rentalOptionId);
                console.log(data);
                if (data) {
                    setCurrentRentalOptions(data);
                }
            } catch (error) {
                console.error("Error fetching rental option data: ", error);
            }
        };

        fetchData();
    }, []);
    const form = useForm<z.infer<typeof ReservationOptionSchema>>({
        resolver: zodResolver(ReservationOptionSchema),
        defaultValues:{
            rentaloption_description: currentRentalOptions?.rentaloption_description,
            duration: currentRentalOptions?.duration.toString(),
            rentalprice: currentRentalOptions?.rentalprice.toFixed(2).toString(),
        },
    })
    

    const onSubmit = (values: z.infer<typeof ReservationOptionSchema>) => {
        console.log("Submitted values:", values);
    
        setError("");
        setSuccess("");
    
        startTransition(() => {
            const validation = ReservationOptionSchema.safeParse(values);
            if (!validation.success) {
                console.error("Validation error:", validation.error);
                setError("Invalid fields");
                return;
            }
    
            editReservationOption(rentalOptionId ,validation.data)
                .then((data) => {
                    if (data.error) {
                        console.error("Create reservation option error:", data.error);
                        setError(data.error);
                    } else if (data.success) {
                        console.log("Reservation option created successfully:", data.success);
                        setSuccess(data.success);
                    }
                })
                .catch((error) => {
                    console.error("Create reservation option error:", error);
                    setError("Failed to create reservation option");
                });
        });
    };
    
    return (
        <CardWrapper headerLabel="Edit rental option" backButtonLabel="Go back to rental option list" backButtonHref="/rentaloptions/listrentaloptions">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6">
                        <div className="space-y-4">
                            <FormField control={form.control}
                            name="duration"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>
                                        Duration of rental option (in minutes)
                                    </FormLabel>
                                    <FormControl>
                                    <Input
                                        defaultValue={currentRentalOptions?.duration}
                                        {...field}
                                        disabled={isPending}
                                    />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }/>
                        </div>
                        <div className="space-y-4">
                            <FormField control={form.control}
                            name="rentalprice"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>
                                        Price of rental
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            defaultValue={currentRentalOptions?.rentalprice.toFixed(2)}
                                            {...field}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }/>
                        </div>
                        <input type="hidden" {...form.register("rentaloption_description")} value={currentRentalOptions?.rentaloption_description} />
                        <FormError message={error}/>
                        <FormSuccess message={success}/>
                        <Button type="submit" className="w-full" 
                                        disabled={isPending}>
                            Save changes
                        </Button>
                </form>
            </Form>
        </CardWrapper>
        
    )
}