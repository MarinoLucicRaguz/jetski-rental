'use client';

import { useEffect, useRef, useState } from 'react';
import { Jetski, Location, RentalOptions } from '@prisma/client';
import { getAllLocations } from '@/actions/getAllLocations';
import Spinner from '../ui/spinner';
import AvailabilityFormModal from '../modal/availabilityForm';
import { Button } from '../ui/button';
import ReservationCard from '@/components/ui/reservationcard';
import { Menu, MenuItem } from '@mui/material';
import { listJetskisByLocation } from '@/actions/listJetskisByLocation';
import JetskiReservationCard from '../ui/jetskireservationcard';
import { getReservationsByDate } from '@/actions/listReservationsForDate';
import { ExtendedReservation } from '@/types';
import { ERROR_MESSAGE } from '@/types/message';
import { DrawingPinIcon } from '@radix-ui/react-icons';
import { getAllRentalOptions } from '@/actions/listReservationOptions';
import { GetTimetableHours } from '@/lib/hoursTimetable';
import { GetAllJetskis } from '@/actions/listJetskis';

export const DashboardPage = () => {
  const [reservations, setReservations] = useState<ExtendedReservation[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [jetskis, setJetskis] = useState<Jetski[]>([]);
  const [rentalOptions, setRentalOptions] = useState<RentalOptions[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isDataLoading, setDataLoading] = useState<boolean>(true);
  const currentDate = new Date();

  useEffect(() => {
    const getData = async () => {
      try {
        const locationsData = await getAllLocations();
        console.log(currentDate);
        const reservationsData = await getReservationsByDate(currentDate);
        const rentalOptionsData = await getAllRentalOptions();
        const timetableHoursData = GetTimetableHours();
        const jetskiData = await GetAllJetskis();

        if (locationsData && reservationsData && rentalOptionsData && timetableHoursData && jetskiData) {
          setLocations(locationsData);
          setReservations(reservationsData);
          setJetskis(jetskiData);
          setRentalOptions(rentalOptionsData);
          setTimetableSlots(timetableHoursData);
          setDataLoading(false);
        } else {
          setError(ERROR_MESSAGE.DATA_LOADING_ERROR);
        }
      } catch (error) {
        setError(ERROR_MESSAGE.DEFAULT_ERROR);
        console.error(error);
      }
    };

    getData();
  }, []);

  console.log(reservations);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow flex justify-center bg-sky-500 p-1">
        <div className="mt-5">
          {!isDataLoading ? (
            <ReservationCard locations={locations} jetskis={jetskis} reservations={reservations} />
          ) : (
            <Spinner /> // Show a loading spinner or some placeholder content
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
