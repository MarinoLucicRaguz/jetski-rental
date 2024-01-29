"use client";

import { useRouter } from "next/navigation";

interface CreateReservationButtonProps {
    children: React.ReactNode;
    mode?: "modal" | "redirect";
    asChild?: boolean;
}

export const CreateReservationButton = ({ children, mode = "redirect", asChild }: CreateReservationButtonProps) => {
    const router = useRouter();

    const onClick = () => {
        router.push("/jetski/createreservation");
    };

    if (mode === "modal") {
        return <span>TODO: Implement modal</span>;
    }

    return (
        <span onClick={onClick} className="cursor-pointer">
            {children}
        </span>
    );
};
