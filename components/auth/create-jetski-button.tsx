"use client";

import { useRouter } from "next/navigation";

interface CreateJetSkiButtonProps {
    children: React.ReactNode;
    mode?: "modal" | "redirect";
    asChild?: boolean;
}

export const CreateJetskiButton = ({ children, mode = "redirect", asChild }: CreateJetSkiButtonProps) => {
    const router = useRouter();

    const onClick = () => {
        router.push("/jetski/createjetski");
    };

    return (
        <span onClick={onClick} className="cursor-pointer">
            {children}
        </span>
    );
};
