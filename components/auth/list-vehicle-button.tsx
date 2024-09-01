'use client';

import { useRouter } from 'next/navigation';

interface ListJetskiButton {
  children: React.ReactNode;
  mode?: 'modal' | 'redirect';
  asChild?: boolean;
}

export const ListJetskiButton = ({ children, mode = 'redirect', asChild }: ListJetskiButton) => {
  const router = useRouter();

  const onClick = () => {
    router.push('/vehicle/listvehicle');
  };

  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
};
