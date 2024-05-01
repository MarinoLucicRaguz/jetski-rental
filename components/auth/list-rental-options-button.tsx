"use client";

import { useRouter } from "next/navigation";

interface ListRentalOptionsButtonProps {
    children: React.ReactNode;
    mode?: "modal" | "redirect";
    asChild?: boolean;
}

export const ListRentalOptionsButton = ({ children, mode = "redirect", asChild }: ListRentalOptionsButtonProps) => {
    const router = useRouter();

    const onClick = () => {
        router.push("/rentaloptions/listrentaloptions");
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
