'use client';

import { useEffect, useState } from 'react';
import { Jetski, Location } from '@prisma/client';
import { getAllLocations } from '@/actions/getAllLocations';
import Spinner from '../ui/spinner';
import AvailabilityFormModal from '../modal/availabilityForm';
import { Button } from '../ui/button';
import ReservationCard from '@/components/ui/reservationcard';
import { Menu, MenuItem } from '@mui/material';
import { listJetskisByLocation } from '@/actions/listJetskisByLocation';
import JetskiReservationCard from '../ui/jetskireservationcard';
import { listReservationsByDate } from '@/actions/listReservationsForDate';
import { ExtendedReservation } from '@/types';
import { ERROR_MESSAGE } from '@/types/message';
import { DrawingPinIcon } from '@radix-ui/react-icons';

export const DashboardPage = () => {
  const [reservations, setReservations] = useState<ExtendedReservation[]>([]);
  const [locationsData, setLocationsData] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [jetskis, setJetskis] = useState<Jetski[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const currentDate = new Date();

  useEffect(() => {
    const getData = async () => {
      try {
        const locations = await getAllLocations();
        const reservationsData = await listReservationsByDate(currentDate);

        if (locations && reservationsData) {
          setLocationsData(locations);
          setReservations(reservationsData);
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

  useEffect(() => {
    if (selectedLocation) {
      const fetchJetskis = async () => {
        try {
          const jetskis = await listJetskisByLocation(
            selectedLocation.location_id
          );
          if (jetskis) setJetskis(jetskis);
          else {
            setError(ERROR_MESSAGE.DATA_LOADING_ERROR);
          }
        } catch (error) {
          setError(ERROR_MESSAGE.DEFAULT_ERROR);
          console.error(error);
        }
      };

      fetchJetskis();
    }
  }, [selectedLocation]);

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

  const handleLocationSelect = (locationId: number | null) => {
    const selected = locationsData.find(
      (loc) => loc.location_id === locationId
    );
    setSelectedLocation(selected || null);
    handleCloseMenu();
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow flex justify-center bg-sky-500 p-6">
        {locationsData && locationsData.length > 0 ? (
          selectedLocation ? (
            <div className="flex overflow-x-auto space-x-4">
              {jetskis.length > 0 ? (
                jetskis.map((jetski) => (
                  <div key={jetski.jetski_id} className="m-4">
                    <JetskiReservationCard
                      jetski={jetski}
                      reservations={reservations}
                      locations={locationsData}
                    />
                  </div>
                ))
              ) : (
                <div className="text-red-500 flex items-center justify-center h-full w-full">
                  {error || <Spinner />}
                </div>
              )}
            </div>
          ) : (
            locationsData.map((location) => (
              <div key={location.location_id} className="m-4">
                <ReservationCard location={location} />
              </div>
            ))
          )
        ) : (
          <div className="text-red-500 flex items-center justify-center h-full w-full">
            {error || <Spinner />}
          </div>
        )}
      </div>
      <div className="absolute top-4 right-8 flex items-center space-x-4">
        {/* <Button onClick={handleOpenModal}>Check Availability</Button> */}
        <Button className="w-40" onClick={handleOpenMenu}>
          <DrawingPinIcon className="mr-2" />
          {selectedLocation?.location_name || 'All locations'}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={() => handleLocationSelect(null)}>
            All locations
          </MenuItem>
          {locationsData?.map((location) => (
            <MenuItem
              key={location.location_id}
              onClick={() => handleLocationSelect(location.location_id)}
            >
              {location.location_name}
            </MenuItem>
          ))}
        </Menu>
      </div>
      {isModalOpen && <AvailabilityFormModal onClose={handleCloseModal} />}
    </div>
  );
};

export default DashboardPage;
