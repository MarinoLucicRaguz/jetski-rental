"use client";

import { useRouter } from "next/navigation";

interface ListLocationsButton {
    children: React.ReactNode;
    mode?: "modal" | "redirect";
    asChild?: boolean;
}

export const ListLocationButton = ({ children, mode = "redirect", asChild }: ListLocationsButton) => {
    const router = useRouter();

    const onClick = () => {
        router.push("/location/listlocation");
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
