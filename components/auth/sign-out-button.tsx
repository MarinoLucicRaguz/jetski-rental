'use client';

import { useRouter } from 'next/navigation';
import { signOutUser } from '@/actions/signOutAction';
import { Button } from '../atoms/button';
import { ArrowRightIcon } from '@radix-ui/react-icons';

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
    <Button className={`mb-2 mt-2 w-60 ${className}`} onClick={handleSignOut} variant="secondary">
      <ArrowRightIcon className="mr-2" />
      Odjavi se
    </Button>
  );
};

export default SignOutButton;
