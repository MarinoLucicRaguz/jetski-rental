"use client";

import { useRouter } from 'next/navigation';
import { signOutUser } from '@/actions/signOutAction';
import { Button } from '../ui/button';

interface SignOutButtonProps {
  className?: string;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({ className }) => {
  const router = useRouter();

  const handleSignOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await signOutUser();
    router.push('/auth/login');
  };

  return (
    <Button className={`w-full mb-3 ${className}`} onClick={handleSignOut} variant="secondary">
      Sign out
    </Button>
  );
};

export default SignOutButton;
