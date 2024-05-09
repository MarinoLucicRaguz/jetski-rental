"use client";

import { Card,CardContent,CardFooter,CardHeader } from "../ui/card";
import { BackButton } from "./back-button";
import { Header } from "./header";

interface CardWrapperProps {
    children: React.ReactNode;
    headerLabel: string;
    backButtonLabel?: string;
    backButtonHref?: string;
    className?: string;
}

export const CardWrapper =({
    children,
    headerLabel,
    backButtonLabel,
    backButtonHref,
    className = "shadow-md md:w-[300px] lg:w-[600px]"

}: CardWrapperProps) => {
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