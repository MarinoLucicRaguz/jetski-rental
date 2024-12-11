'use client';

import { useRouter } from 'next/navigation';

interface CreateLocationButtonProps {
  children: React.ReactNode;
  mode?: 'modal' | 'redirect';
  asChild?: boolean;
}

export const CreateLocationButton = ({ children, mode = 'redirect', asChild }: CreateLocationButtonProps) => {
  const router = useRouter();

  const onClick = () => {
    router.push('/location/createlocation');
  };

  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
};
