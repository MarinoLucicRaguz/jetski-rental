"use client"

import * as z from "zod";
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useState, useTransition } from "react";
import { LocationSchema } from "@/schemas";
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
import { createLocation } from "@/actions/createLocation";


export const LocationForm =() => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof LocationSchema>>({
        resolver: zodResolver(LocationSchema),
        defaultValues:{
            location_name: "",
        },
    })
    
    const onSubmit =(values: z.infer<typeof LocationSchema>)=>{
        //ovdje se moze koristi axios za putanje, ali ovo je kao jednostavnije? nisam siguran, istrazi
        //axios.post("/your/api/route", values)
        setError("");
        setSuccess("");

        startTransition(()=>{
            createLocation(values)
                .then((data)=>{
                    setError(data.error),
                    setSuccess(data.success);
                })
        })
    };
    
    return (
        <CardWrapper headerLabel="Add location" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6">
                        <div className="space-y-4">
                            <FormField control={form.control}
                            name="location_name"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>
                                        Location name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                        {...field}
                                        disabled={isPending}
                                        placeholder=""
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                            }/>
                        </div>
                        <FormError message={error}/>
                        <FormSuccess message={success}/>
                        <Button type="submit" className="w-full" 
                                        disabled={isPending}>
                            Add a location!
                        </Button>
                </form>
            </Form>
        </CardWrapper>
        
    )
}