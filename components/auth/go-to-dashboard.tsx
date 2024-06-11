"use client";

import { useRouter } from "next/navigation";

interface DashboardButtonProps{
    children: React.ReactNode;
    mode?: "modal" | "redirect";
    asChild?: boolean;
}

export const DashboardButton = ({ children, mode = "redirect", asChild }: DashboardButtonProps) => {
    const router = useRouter();

    const onClick = () => {
        router.push("/dashboard");
    };

    return (
        <span onClick={onClick} className="cursor-pointer">
            {children}
        </span>
    );
};
