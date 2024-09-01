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
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import ErrorPopup from "../ui/errorpopup";


export const ReservationOptionForm =() => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const [showError, setShowError] = useState(false);
    const router = useRouter();

    const user = useCurrentUser();

    const form = useForm<z.infer<typeof ReservationOptionSchema>>({
        resolver: zodResolver(ReservationOptionSchema),
        defaultValues:{
            rentaloption_description: "",
            duration: undefined,
            rentalprice: undefined
        },
    })

    useEffect(() => {
        if (user && user.role !== "ADMIN") {
          setShowError(true);
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        }
      }, [user, router]);
      
      if (user && user.role !== "ADMIN") {
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
    
            createReservationOption(validation.data)
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
        <CardWrapper headerLabel="Add rental option" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
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
                                            placeholder="Please set duration in minutes..."
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
                                            placeholder="Please set price of rental..."
                                            {...field}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }/>
                        </div>
                        <FormField name="rentaloption_description" render={({field})=>(
                            <FormItem>
                                <FormLabel className="text-sm font-bold">Rental option: </FormLabel>
                                <FormControl className="w-40 bg-black text-white text-center rounded-mb border-solid p-2">
                                    <select {...field} value={field.value ?? '' } className="w-full bg-black text-white text-center rounded-md border-solid" onChange={(event)=>{
                                        const selectedValue = event.target.value;
                                        field.onChange(selectedValue);
                                    }}>
                                        <option value="" hidden disabled>Select an option</option>
                                        <option value="REGULAR" >
                                            Regular rental
                                        </option>
                                        <option value="SAFARI" >
                                            Safari tour
                                        </option>
                                    </select>
                                </FormControl>
                            </FormItem>
                        )}/>
                        <FormError message={error}/>
                        <FormSuccess message={success}/>
                        <Button type="submit" className="w-full" 
                                        disabled={isPending}>
                            Add a rental option
                        </Button>
                </form>
            </Form>
        </CardWrapper>
        
    )
}