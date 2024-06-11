"use client";

import { Card,CardContent,CardFooter,CardHeader } from "../ui/card";
import { BackButton } from "./back-button";
import { Header } from "./header";

interface AuthCardWrapperProps {
    children: React.ReactNode;
    headerLabel: string;
    backButtonLabel?: string;
    backButtonHref?: string;
    className?: string;
}

export const AuthCardWrapper =({
    children,
    headerLabel,
    backButtonLabel,
    backButtonHref,
    className = "shadow-md md:w-[300px] lg:w-[600px]"

}: AuthCardWrapperProps) => {
    return (
        <Card className={`shadow-md ${className}`}>
            <CardHeader>
                <Header label={headerLabel}/>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
            <CardFooter>
                <BackButton
                    label={backButtonLabel || ""}
                    href={backButtonHref || ""}
                />
            </CardFooter>
        </Card>
    )
}