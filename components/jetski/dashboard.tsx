'use client';

import { useEffect, useState } from 'react';
import { Jetski, Location } from '@prisma/client';
import { listLocation } from '@/actions/listLocations';
import Spinner from '../ui/spinner';
import AvailabilityFormModal from '../modal/availabilityForm';
import { Button } from '../ui/button';
import ReservationCard from '@/components/ui/reservationcard';
import { Menu, MenuItem } from '@mui/material';
import { listJetskisByLocation } from '@/actions/listJetskisByLocation';
import JetskiReservationCard from '../ui/jetskireservationcard';
import { listReservationsByDate } from '@/actions/listReservationsForDate';
import { ExtendedReservation } from '@/types';

export const DashboardPage = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [reservations, setReservations] = useState<ExtendedReservation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [jetskis, setJetskis] = useState<Jetski[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const locationData = await listLocation();
        if (locationData) setLocations(locationData);
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours());
        console.log(currentDate);
        const reservationsData = await listReservationsByDate(currentDate);
        if (reservationsData) {
          setReservations(reservationsData);
        }
        console.log(reservationsData);
      } catch (error) {
        setError('Failed to fetch locations');
        console.error(error);
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      const fetchJetskis = async () => {
        try {
          const jetskiData = await listJetskisByLocation(
            selectedLocation.location_id
          );
          if (jetskiData) setJetskis(jetskiData);
        } catch (error) {
          setError('Failed to fetch jetskis');
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
    const selected = locations.find((loc) => loc.location_id === locationId);
    setSelectedLocation(selected || null);
    handleCloseMenu();
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="py-4">
        <div className="container mx-auto text-center text-white font-bold text-xl">
          DASHBOARD
        </div>
      </header>
      <div className="flex-grow flex justify-center bg-sky-500 p-6">
        {locations && locations.length > 0 ? (
          selectedLocation ? (
            <div className="flex overflow-x-auto space-x-4">
              {jetskis.length > 0 ? (
                jetskis.map((jetski) => (
                  <div key={jetski.jetski_id} className="m-4">
                    <JetskiReservationCard
                      jetski={jetski}
                      reservations={reservations}
                      locations={locations}
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
            locations.map((location) => (
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
          {locations?.map((location) => (
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
