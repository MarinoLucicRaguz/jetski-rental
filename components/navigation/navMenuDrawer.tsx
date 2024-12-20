'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import { Button } from '../atoms/button';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import NavMenu from './navMenu';

interface NavMenuDrawerProps {
  userRole: string;
}

export default function NavMenuDrawer({ userRole }: NavMenuDrawerProps): JSX.Element {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: { xs: '100vw', sm: '300px' }, overflow: 'hidden' }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        <div className="flex flex-row items-center justify-center border-b-4 border-sky-900 p-1">
          <HamburgerMenuIcon />
          <span className="ml-2">IZBORNIK</span>
        </div>
        <NavMenu userRole={userRole} />
      </List>
    </Box>
  );

  return (
    <div>
      <Button variant="secondary" size="lg" onClick={toggleDrawer(true)}>
        <HamburgerMenuIcon style={{ marginRight: '8px' }} /> Prikaži izbornik
      </Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
