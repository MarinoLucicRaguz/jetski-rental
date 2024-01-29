"use client"

import * as z from "zod";
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useState, useTransition } from "react";
import { JetskiSchema } from "@/schemas";
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
import { createJetski } from "@/actions/createJetski";


export const JetskiForm =() => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof JetskiSchema>>({
        resolver: zodResolver(JetskiSchema),
        defaultValues:{
            jetski_registration: "",
            jetski_status: "available",
        },
    })
    
    const onSubmit =(values: z.infer<typeof JetskiSchema>)=>{
        //ovdje se moze koristi axios za putanje, ali ovo je kao jednostavnije? nisam siguran, istrazi
        //axios.post("/your/api/route", values)
        setError("");
        setSuccess("");

        startTransition(()=>{
            createJetski(values)
                .then((data)=>{
                    setError(data.error),
                    setSuccess(data.success);
                })
        })
    };
    
    return (
        <CardWrapper headerLabel="Add a Jet Ski" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6">
                        <div className="space-y-4">
                            <FormField control={form.control}
                            name="jetski_registration"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>
                                        Registration
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
                            Add a Jet Ski
                        </Button>
                </form>
            </Form>
        </CardWrapper>
        
    )
}