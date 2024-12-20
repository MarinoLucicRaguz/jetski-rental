'use client';

import { useEffect, useRef, useState } from 'react';
import { Jetski, Location, RentalOptions } from '@prisma/client';
import { GetLocations } from '@/actions/getAllLocations';
import Spinner from '../ui/spinner';
import ReservationCard from '@/components/ui/reservationcard';
import { getReservationsByDate } from '@/actions/listReservationsForDate';
import { ExtendedReservation } from '@/types';
import { ERROR_MESSAGE } from '@/types/message';
import { getAllRentalOptions } from '@/actions/listReservationOptions';
import { GetTimetableHours } from '@/lib/hoursTimetable';
import { GetAllJetskis } from '@/actions/listJetskis';
import LocationMenu from '../ui/dropdownSelectors/dropdownLocationMenu';

export const DashboardPage = () => {
  const [reservations, setReservations] = useState<ExtendedReservation[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [jetskis, setJetskis] = useState<Jetski[]>([]);
  const [rentalOptions, setRentalOptions] = useState<RentalOptions[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<string[]>([]);

  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isDataLoading, setDataLoading] = useState<boolean>(true);
  const currentDate = new Date();

  useEffect(() => {
    const getData = async () => {
      try {
        const locationsData = await GetLocations();
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

  const handleSelectedLocation = (locationId: number | null) => {
    setSelectedLocationId(locationId);
  };

  const filteredLocations = selectedLocationId ? locations.filter((location) => location.location_id === selectedLocationId) : locations;

  return (
    <div>
      <LocationMenu locations={locations} onLocationSelect={handleSelectedLocation} />
      <div className="flex flex-col h-screen">
        <div className="flex-grow flex justify-center bg-sky-500 p-6 mt-5">
          <div>{!isDataLoading ? <ReservationCard locations={filteredLocations} jetskis={jetskis} reservations={reservations} /> : <Spinner />}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
