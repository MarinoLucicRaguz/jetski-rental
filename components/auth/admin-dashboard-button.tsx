"use client";

import { useRouter } from "next/navigation";

interface AdminDashboardButtonProps {
    children: React.ReactNode;
    mode?: "modal" | "redirect";
    asChild?: boolean;
}

export const AdminDashboardButton = ({ children, mode = "redirect", asChild }: AdminDashboardButtonProps) => {
    const router = useRouter();

    const onClick = () => {
        router.push("/admindashboard");
    };

    return (
        <span onClick={onClick} className="cursor-pointer">
            {children}
        </span>
    );
};
