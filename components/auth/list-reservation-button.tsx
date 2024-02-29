"use client";

import { useRouter } from "next/navigation";

interface ListReservationButton {
    children: React.ReactNode;
    mode?: "modal" | "redirect";
    asChild?: boolean;
}

export const ListReservationButton = ({ children, mode = "redirect", asChild }: ListReservationButton) => {
    const router = useRouter();

    const onClick = () => {
        router.push("/jetski/listreservation");
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
