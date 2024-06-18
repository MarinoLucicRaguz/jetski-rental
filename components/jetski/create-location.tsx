"use client"

import * as z from "zod";
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useEffect, useState, useTransition } from "react";
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
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import ErrorPopup from "../ui/errorpopup";
import { User } from "@prisma/client";
import { getAuthUsers } from "@/actions/getAuthUsers";
import { MenuItem, Select } from "@mui/material";

export const LocationForm = () => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const [users, setUsers] = useState<User[] | null>([]);

    const [showError, setShowError] = useState(false);
    const router = useRouter();

    const user = useCurrentUser();

    const form = useForm<z.infer<typeof LocationSchema>>({
        resolver: zodResolver(LocationSchema),
        defaultValues: {
            location_name: "",
            user_id: null,
        },
    });

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
        const fetchUsers = async () => {
            try {
                const users = await getAuthUsers();
                setUsers(users);
            } catch (error) {
                setError("Unable to fetch users. There has been an error!");
            }
        };
        fetchUsers();
    }, []);

    const onSubmit = (values: z.infer<typeof LocationSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            createLocation(values)
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                    } else {
                        setSuccess(data.success);
                    }
                });
        });
    };

    return (
        <CardWrapper headerLabel="Add location" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormField control={form.control} name="location_name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location name</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} placeholder="" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {user && user.role==="ADMIN" && (
                        <FormField control={form.control} name="user_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Manager</FormLabel>
                                <FormControl>
                                    <Select
                                        {...field}
                                        disabled={isPending}
                                        className="w-full border border-gray-300 rounded-sm"
                                        size="small"
                                        displayEmpty
                                        renderValue={(selected) => {
                                            if (selected === null || selected === "") {
                                                return <span>Select a manager</span>;
                                            }
                                            const selectedUser = users?.find(user => user.user_id === selected);
                                            return selectedUser ? (selectedUser.name || selectedUser.email) : "";
                                        }}
                                        onChange={(e) => field.onChange(e.target.value || null)}
                                    >
                                        <MenuItem value="">No manager</MenuItem>
                                        {users?.map(user => (
                                            <MenuItem key={user.user_id} value={user.user_id}>
                                                {user.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    )}
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button type="submit" className="w-full" disabled={isPending}>
                        Add a location!
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
}
