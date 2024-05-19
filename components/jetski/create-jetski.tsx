"use client";

import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useState, useTransition, useEffect } from "react";
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

import { CardWrapper } from "@/components/auth/card-wrapper";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { createJetski } from "@/actions/createJetski";
import { listLocation } from "@/actions/listLocations";
import { Location } from "@prisma/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import ErrorPopup from "../ui/errorpopup";
import { useRouter } from "next/navigation";

export const JetskiForm = () => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const [locations, setLocations] = useState<Location[]>([]);

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

    const form = useForm<z.infer<typeof JetskiSchema>>({
        resolver: zodResolver(JetskiSchema),
        defaultValues: {
            jetski_registration: "",
            jetski_location_id: null, 
            jetski_model: "",
            jetski_topSpeed: "",
            jetski_kW: "",
            jetski_manufacturingYear: "",
        },
    });

    useEffect(() => {
        listLocation()
            .then((data) => {
                if (data !== null) setLocations(data);
            })
            .catch((error) => {
                console.error("Error fetching locations: ", error);
            });
    }, []);

    const onSubmit = (values: z.infer<typeof JetskiSchema>) => {
        setError("");
        setSuccess("");
        
        startTransition(() => {
            createJetski(values)
                .then((data) => {
                    setError(data.error),
                    setSuccess(data.success);
                });
        });
    };
    
    return (
        <CardWrapper
            headerLabel="Add a Jet Ski"
            backButtonLabel="Go back to dashboard"
            backButtonHref="/dashboard"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="jetski_registration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Registration</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="DB-12345"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space y-6">
                        <FormField
                            control={form.control}
                            name="jetski_location_id"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex justify-between">
                                        <FormLabel className="sans-serif text-bold text-center p-3">CHOOSE LOCATION: </FormLabel>
                                        <FormControl className="rounded-sm text-center bg-black text-white border-solid p-2">
                                            <select {...form.register("jetski_location_id",{valueAsNumber:true, })}disabled={isPending}>
                                                <option value="" disabled hidden>Select a location</option>
                                                {locations.map((location)=>(
                                                    <option
                                                        key={location.location_id}
                                                        value={location.location_id}
                                                        >{location.location_name.toUpperCase()}
                                                    </option>
                                                    
                                                ))}
                                            </select>
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space y-6">
                        <FormField control={form.control} name="jetski_model" render={({field})=>(
                            <FormItem>
                                <FormLabel >Model</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={isPending}
                                        placeholder="Yamaha Waverunner"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <div className="space y-6">
                        <FormField control={form.control} name="jetski_topSpeed" render={({field})=>(
                            <FormItem>
                                <FormLabel >Top speed</FormLabel>
                                <FormControl>
                                    <Input
                                    {...field}
                                    disabled={isPending}
                                    placeholder="50 mph"
                                    />
                                </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>
                    <div className="space y-6">
                        <FormField control={form.control} name="jetski_kW" render={({field})=>(
                            <FormItem>
                                <FormLabel >kW</FormLabel>
                                <FormControl>
                                    <Input
                                    {...field}
                                    disabled={isPending}
                                    placeholder="85 kW"
                                    />
                                </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>
                    <div className="space y-6">
                        <FormField control={form.control} name="jetski_manufacturingYear" render={({field})=>(
                            <FormItem>
                                <FormLabel >Manufacturing year</FormLabel>
                                <FormControl>
                                    <Input
                                    {...field}
                                    disabled={isPending}
                                    placeholder="2020"
                                    />
                                </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button type="submit" className="w-full" disabled={isPending}>
                        Add a Jet Ski
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};
