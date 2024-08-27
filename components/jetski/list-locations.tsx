'use client';

import { useEffect, useState, useTransition } from 'react';
import { getAllLocations } from '@/actions/getAllLocations';
import { deleteLocation } from '@/actions/deleteLocation';
import { Location, Jetski, User } from '@prisma/client';
import { CardWrapper } from '../auth/card-wrapper';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getAllJetskis } from '@/actions/listJetskis';
import { getUsers } from '@/actions/getUsers';
import LocationDetailsModal from '../modal/locationDetails';
import { FormError } from '../form-error';
import { getReservationByJetskiIds } from '@/actions/getFirstReservationByJetskiId';
import { ExtendedReservation } from '@/types';

export const ListLocation = () => {
  const [error, setError] = useState<string | undefined>('');
  const [locationData, setLocationData] = useState<Location[] | null>([]);
  const [jetskiData, setJetskiData] = useState<Jetski[] | null>([]);
  const [userData, setUserData] = useState<User[] | null>([]);
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationJetskis, setLocationJetskis] = useState<Jetski[] | null>([]);
  const [locationUsers, setLocationUsers] = useState<User[] | null>([]);
  const [reservationData, setReservationData] = useState<{
    [key: number]: ExtendedReservation | null;
  }>({});

  const router = useRouter();
  const user = useCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        startTransition(() => {
          setError('');
        });

        const data = await getAllLocations();
        setLocationData(data);
        const jetskis = await getAllJetskis();
        setJetskiData(jetskis);
        const users = await getUsers();
        setUserData(users);
      } catch (error) {
        setError('Error fetching locations');
      }
    };

    fetchData();
  }, [startTransition]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleEditClick = (locationId: number) => {
    router.push(`/location/${locationId}/editlocation`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDetailsClick = async (location: Location) => {
    try {
      setSelectedLocation(location);
      const locationJetskis = jetskiData?.filter((jetski) => jetski.jetski_location_id === location.location_id) || [];
      const locationUsers = userData?.filter((user) => user.user_location_id === location.location_id) || [];

      const jetskiIds = locationJetskis.map((jetski) => jetski.jetski_id);
      const reservations = await getReservationByJetskiIds(jetskiIds);

      setLocationJetskis(locationJetskis);
      setLocationUsers(locationUsers);
      setReservationData(reservations);
      setIsModalOpen(true);
    } catch (error) {
      setError('Error fetching details');
    }
  };

  const handleDeleteClick = async (locationId: number) => {
    try {
      const deletionResult = await deleteLocation(locationId);
      if (deletionResult.error === 'ExistingReservations') {
        setError('Cannot delete location with existing reservations. Please remove all the reservations from this location to continue.');
      } else if (deletionResult.error) {
        setError(deletionResult.error);
      } else {
        setLocationData((prevData) => prevData?.filter((loc) => loc.location_id !== locationId) || null);
      }
    } catch (error) {
      setError('Error deleting location');
    }
  };

  return (
    <CardWrapper
      headerLabel="Locations"
      backButtonLabel="Go back to dashboard"
      backButtonHref="/dashboard"
      className="shadow-md md:w-[750px] lg:w-[900px]"
    >
      <div className="space-y-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Location Name</th>
              <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
              <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase text-center tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {locationData?.map((location) => (
              <tr key={location.location_id}>
                <td className="px-6 py-4 whitespace-nowrap">{location.location_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {userData?.find((user) => user.user_id === location.location_manager_id)?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {userData?.find((user) => user.user_id === location.location_manager_id)?.contactNumber || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button variant="yellow" onClick={() => handleDetailsClick(location)}>
                    Details
                  </Button>
                  {user?.role === 'ADMIN' && (
                    <>
                      <Button onClick={() => handleEditClick(location.location_id)}>Edit</Button>
                      <Button variant="destructive" onClick={() => handleDeleteClick(location.location_id)}>
                        Delete
                      </Button>
                    </>
                  )}
                  {user?.role === 'MODERATOR' && location.location_id === user.location_id && (
                    <Button onClick={() => handleEditClick(location.location_id)}>Edit</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-center">
          <FormError message={error} />
        </div>
      </div>
      {isModalOpen && selectedLocation && locationJetskis && locationUsers && (
        <LocationDetailsModal
          location={selectedLocation}
          jetskis={locationJetskis}
          users={locationUsers}
          onClose={handleCloseModal}
          reservationsData={reservationData}
        />
      )}
    </CardWrapper>
  );
};
