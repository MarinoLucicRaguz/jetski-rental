'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Header } from './header';
import { Button } from '../ui/button';

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel?: string;
  backButtonHref?: string;
  className?: string;
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  className = 'shadow-md xs:w-[350px] sm:w-[600px] md:w-[800px] lg:w-[1400px]',
}: CardWrapperProps) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="ghost" onClick={handleGoBack}>
          Nazad
        </Button>
      </CardFooter>
    </Card>
  );
};
