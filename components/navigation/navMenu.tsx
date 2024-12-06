'use client';

import { Button } from '../ui/button';
import SignOutButton from '../auth/sign-out-button';
import navMenuMapper from '@/lib/navMenuMapper';

interface NavMenuProps {
  userRole: string;
}

const NavMenu = ({ userRole }: NavMenuProps) => {
  const menuItems = navMenuMapper[userRole] || [];

  return (
    <nav>
      <div className="flex h-screen flex-col items-center bg-sky-500">
        <div className="mb-2 w-full border-b-4 border-sky-900"></div>
        {menuItems.map(({ Component, props }, index) => (
          <Component key={index}>
            <Button className="mb-2 w-60" type="submit" variant={props?.variant}>
              {props?.icon}
              {props?.text}
            </Button>
          </Component>
        ))}
        <div className="w-full border-b-4 border-sky-900"></div>
        <SignOutButton />
      </div>
    </nav>
  );
};

export default NavMenu;
