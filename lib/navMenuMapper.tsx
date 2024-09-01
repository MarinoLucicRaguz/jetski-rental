import { AdminDashboardButton } from '@/components/auth/admin-dashboard-button';
import { CreateJetskiButton } from '@/components/auth/create-vehicle-button';
import { CreateLocationButton } from '@/components/auth/create-location-button';
import { CreateReservationButton } from '@/components/auth/create-reservation-button';
import { CreateReservationOptionButton } from '@/components/auth/create-reservation-option-button';
import { DashboardButton } from '@/components/auth/go-to-dashboard';
import { ListJetskiButton } from '@/components/auth/list-vehicle-button';
import { ListLocationButton } from '@/components/auth/list-locations-button';
import { ListRentalOptionsButton } from '@/components/auth/list-rental-options-button';
import { ListReservationButton } from '@/components/auth/list-reservation-button';
import { SettingsButton } from '@/components/auth/settings-button';
import NavMenuDivider from '@/components/ui/navMenuDivider';
import Divider from '@mui/material/Divider';

import { HomeIcon, ArchiveIcon, GearIcon, PlusCircledIcon, ReaderIcon } from '@radix-ui/react-icons';
import { ElementType, ReactNode } from 'react';

interface MenuItemProps {
  icon: ReactNode;
  text: string;
  variant: 'secondary';
}

interface MenuItem {
  Component: ElementType;
  props?: MenuItemProps;
}

interface Divider {
  Component: typeof NavMenuDivider;
}

type NavMenuItem = MenuItem | Divider;

const navMenuMapper: Record<string, MenuItem[]> = {
  ADMIN: [
    {
      Component: DashboardButton,
      props: {
        variant: 'secondary',
        icon: <HomeIcon className="mr-2" />,
        text: 'Početna stranica',
      },
    },
    {
      Component: AdminDashboardButton,
      props: {
        variant: 'secondary',
        icon: <ArchiveIcon className="mr-2" />,
        text: 'Upraviteljska ploča',
      },
    },
    {
      Component: SettingsButton,
      props: {
        variant: 'secondary',
        icon: <GearIcon className="mr-2" />,
        text: 'Korisničke postavke',
      },
    },
    { Component: NavMenuDivider },
    {
      Component: CreateJetskiButton,
      props: {
        variant: 'secondary',
        icon: <PlusCircledIcon className="mr-2" />,
        text: 'Dodaj novo plovilo',
      },
    },
    {
      Component: CreateLocationButton,
      props: {
        variant: 'secondary',
        icon: <PlusCircledIcon className="mr-2" />,
        text: 'Dodaj novu lokaciju',
      },
    },
    {
      Component: CreateReservationOptionButton,
      props: {
        variant: 'secondary',
        icon: <PlusCircledIcon className="mr-2" />,
        text: 'Dodaj opciju najma',
      },
    },
    {
      Component: CreateReservationButton,
      props: {
        variant: 'secondary',
        icon: <PlusCircledIcon className="mr-2" />,
        text: 'Dodaj novu rezervaciju',
      },
    },
    { Component: NavMenuDivider },
    {
      Component: ListJetskiButton,
      props: {
        variant: 'secondary',
        icon: <ReaderIcon className="mr-2" />,
        text: 'Popis plovila',
      },
    },
    {
      Component: ListLocationButton,
      props: {
        variant: 'secondary',
        icon: <ReaderIcon className="mr-2" />,
        text: 'Popis lokacija',
      },
    },
    {
      Component: ListRentalOptionsButton,
      props: {
        variant: 'secondary',
        icon: <ReaderIcon className="mr-2" />,
        text: 'Popis opcija najma',
      },
    },
    {
      Component: ListReservationButton,
      props: {
        variant: 'secondary',
        icon: <ReaderIcon className="mr-2" />,
        text: 'Popis rezervacija',
      },
    },
  ],
  MODERATOR: [
    {
      Component: DashboardButton,
      props: {
        variant: 'secondary',
        icon: <HomeIcon className="mr-2" />,
        text: 'Početna stranica',
      },
    },
    {
      Component: SettingsButton,
      props: {
        variant: 'secondary',
        icon: <GearIcon className="mr-2" />,
        text: 'Korisničke postavke',
      },
    },
    { Component: NavMenuDivider },
    {
      Component: CreateJetskiButton,
      props: {
        variant: 'secondary',
        icon: <PlusCircledIcon className="mr-2" />,
        text: 'Dodaj novo plovilo',
      },
    },
    {
      Component: CreateLocationButton,
      props: {
        variant: 'secondary',
        icon: <PlusCircledIcon className="mr-2" />,
        text: 'Dodaj novu lokaciju',
      },
    },
    {
      Component: CreateReservationButton,
      props: {
        variant: 'secondary',
        icon: <PlusCircledIcon className="mr-2" />,
        text: 'Dodaj novu rezervaciju',
      },
    },
    { Component: NavMenuDivider },
    {
      Component: ListJetskiButton,
      props: {
        variant: 'secondary',
        icon: <ReaderIcon className="mr-2" />,
        text: 'Popis plovila',
      },
    },
    {
      Component: ListLocationButton,
      props: {
        variant: 'secondary',
        icon: <ReaderIcon className="mr-2" />,
        text: 'Popis lokacija',
      },
    },
    {
      Component: ListRentalOptionsButton,
      props: {
        variant: 'secondary',
        icon: <ReaderIcon className="mr-2" />,
        text: 'Popis opcija najma',
      },
    },
    {
      Component: ListReservationButton,
      props: {
        variant: 'secondary',
        icon: <ReaderIcon className="mr-2" />,
        text: 'Popis rezervacija',
      },
    },
  ],
  USER: [
    {
      Component: DashboardButton,
      props: {
        variant: 'secondary',
        icon: <HomeIcon className="mr-2" />,
        text: 'Početna stranica',
      },
    },
    { Component: NavMenuDivider },
    {
      Component: ListJetskiButton,
      props: {
        variant: 'secondary',
        icon: <ReaderIcon className="mr-2" />,
        text: 'Popis plovila',
      },
    },
    {
      Component: ListLocationButton,
      props: {
        variant: 'secondary',
        icon: <ReaderIcon className="mr-2" />,
        text: 'Popis lokacija',
      },
    },
    {
      Component: ListRentalOptionsButton,
      props: {
        variant: 'secondary',
        icon: <ReaderIcon className="mr-2" />,
        text: 'Popis opcija najma',
      },
    },
    {
      Component: ListReservationButton,
      props: {
        variant: 'secondary',
        icon: <ReaderIcon className="mr-2" />,
        text: 'Popis rezervacija',
      },
    },
  ],
};

export default navMenuMapper;
