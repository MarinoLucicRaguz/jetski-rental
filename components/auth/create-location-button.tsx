"use client";

import { useRouter } from "next/navigation";

interface CreateLocationButtonProps {
    children: React.ReactNode;
    mode?: "modal" | "redirect";
    asChild?: boolean;
}

export const CreateLocationButton = ({ children, mode = "redirect", asChild }: CreateLocationButtonProps) => {
    const router = useRouter();

    const onClick = () => {
        router.push("/jetski/createlocation");
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
