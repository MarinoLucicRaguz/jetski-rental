'use client';
import { useEffect, useState, useMemo } from 'react';
import { GetAllJetskis } from '@/actions/listJetskis';
import { Jetski, Location, JetskiStatus } from '@prisma/client';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { updateJetskiStatus } from '@/actions/updateJetskiStatus';
import { getAllLocations } from '@/actions/getAllLocations';
import { Menu, MenuItem } from '@mui/material';
import Spinner from '../ui/spinner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { deleteJetski } from '@/actions/vehicleActions/deleteJetski';
import { getCurrentlyRunningJetskis } from '@/actions/getCurrentlyRunningJetkis';

function convertStatusToText(currentStatus: JetskiStatus) {
  switch (currentStatus) {
    case 'AVAILABLE':
      return 'Operational';
    case 'NOT_AVAILABLE':
      return 'Temporary out of service.';
    case 'NOT_IN_FLEET':
      return 'Decommissioned.';
    default:
      'Unknown status.';
  }
}

type JetskiSortBy =
  | 'jetski_id'
  | 'jetski_registration'
  | 'jetski_model'
  | 'jetski_topSpeed'
  | 'jetski_kW'
  | 'jetski_manufacturingYear'
  | 'jetski_status'
  | 'jetski_location_id';

export const ListJetski = () => {
  const [error, setError] = useState<string | undefined>('');
  const [jetskiData, setJetskiData] = useState<Jetski[] | null>([]);
  const [locationNames, setLocationNames] = useState<Location[] | null>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = useState<JetskiSortBy>('jetski_registration');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [runningJetski, setRunningJetski] = useState<Jetski[] | null>([]);
  const router = useRouter();

  const user = useCurrentUser();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locations = await getAllLocations();
        setLocationNames(locations);
      } catch (error) {
        setError('Error fetching locations');
      }
    };

    const fetchJetskis = async () => {
      try {
        const jetskis = await GetAllJetskis();
        setJetskiData(jetskis);
      } catch (error) {
        setError('Error fetching jetskis');
      }
    };

    const fetchCurrentlyRunningJetskis = async () => {
      try {
        const jetski = await getCurrentlyRunningJetskis();
        setRunningJetski(jetski);
      } catch (error) {
        setError('Error fetching current running jetskis');
      }
    };

    Promise.all([fetchLocations(), fetchJetskis(), fetchCurrentlyRunningJetskis()]).then(() => {
      setLoadingData(false);
    });
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handleSort = (key: JetskiSortBy) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const filteredJetskis = useMemo(() => {
    return jetskiData?.filter(
      (jetski) =>
        (selectedLocation === null || jetski.jetski_location_id === selectedLocation) && (!showOnlyAvailable || jetski.jetski_status === 'AVAILABLE')
    );
  }, [jetskiData, selectedLocation, showOnlyAvailable]);

  const sortedFilteredJetskis = useMemo(() => {
    if (!filteredJetskis) return [];

    const sorted = [...filteredJetskis];
    sorted.sort((a, b) => {
      const aValue = a[sortBy]!;
      const bValue = b[sortBy]!;

      if (aValue === bValue) return 0;

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [jetskiData, sortBy, sortDirection, selectedLocation, showOnlyAvailable]);

  const handleEditJetskiClick = (vehicleId: number) => {
    router.push(`/vehicle/${vehicleId}/editvehicle`);
  };

  const handleJetskiStatusClick = async (jetskiId: number) => {
    try {
      await updateJetskiStatus(jetskiId);
      setJetskiData(
        (prevJetskiData) =>
          prevJetskiData?.map((jetski) =>
            jetski.jetski_id === jetskiId
              ? {
                  ...jetski,
                  jetski_status: jetski.jetski_status === 'AVAILABLE' ? 'NOT_AVAILABLE' : 'AVAILABLE',
                }
              : jetski
          ) || []
      );
    } catch (error) {
      setError('Error deleting jetski');
    }
  };

  const handleJetskiRemoveClick = async (jetskiId: number) => {
    try {
      await deleteJetski(jetskiId);
      setJetskiData(
        (prevJetskiData) =>
          prevJetskiData?.map((jetski) => (jetski.jetski_id === jetskiId ? { ...jetski, jetski_status: 'NOT_IN_FLEET' } : jetski)) || []
      );
    } catch (error) {
      setError('Error deleting jetski');
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLocationSelect = (location_id: number | null) => {
    setSelectedLocation(location_id);
    setAnchorEl(null);
  };

  const getLocationName = (locationId: number | null, locations: Location[] | null) => {
    if (locations === null) {
      return 'No location';
    }
    const location = locations.find((loc) => loc.location_id === locationId);
    return location ? location.location_name : 'No location';
  };

  return (
    <div className="relative w-full h-full">
      {loadingData && (
        <div className="flex justify-center items-center" style={{ backgroundColor: '#38bdf8' }}>
          <Spinner />
        </div>
      )}

      <div className={`p-10 bg-white rounded-sm ${loadingData ? 'opacity-100' : ''}`}>
        <div className="flex flex-col space-y-4">
          <div className="text-center text-2xl font-bold uppercase text-black">{showOnlyAvailable ? 'Available jetskis' : 'All jetskis'}</div>
          <div className="flex justify-between">
            <Button onClick={handleClick}>
              {selectedLocation ? locationNames?.find((location) => location.location_id === selectedLocation)?.location_name : 'All locations'}
            </Button>
            <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose}>
              <MenuItem onClick={() => handleLocationSelect(null)}>All locations</MenuItem>
              {locationNames?.map((location) => (
                <MenuItem key={location.location_id} onClick={() => handleLocationSelect(location.location_id)}>
                  {location.location_name}
                </MenuItem>
              ))}
            </Menu>
            <Button onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}>
              {showOnlyAvailable ? 'Display all jetskis' : 'Display only available jetskis'}
            </Button>
          </div>
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('jetski_registration')}>
                  Registration
                </th>
                <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('jetski_model')}>
                  Model
                </th>
                <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('jetski_manufacturingYear')}>
                  Year
                </th>
                <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('jetski_topSpeed')}>
                  Top Speed
                </th>
                <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('jetski_status')}>
                  Status
                </th>
                <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('jetski_location_id')}>
                  Location
                </th>
                {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && <th className="px-6 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedFilteredJetskis?.map((jetski) => (
                <tr key={jetski.jetski_id} className="bg-white border-b">
                  <td className="px-6 py-4">{jetski.jetski_registration}</td>
                  <td className="px-6 py-4">{jetski.jetski_model}</td>
                  <td className="px-6 py-4">{jetski.jetski_manufacturingYear}</td>
                  <td className="px-6 py-4">{jetski.jetski_topSpeed}</td>
                  <td className="px-6 py-4">{convertStatusToText(jetski.jetski_status)}</td>
                  <td className="px-6 py-4">{getLocationName(jetski.jetski_location_id, locationNames)}</td>
                  {(user?.role === 'ADMIN' || (user?.role === 'MODERATOR' && jetski.jetski_location_id === user.location_id)) && (
                    <td className="px-6 py-4">
                      {jetski.jetski_status !== 'NOT_IN_FLEET' ? (
                        runningJetski?.find((j) => j.jetski_id === jetski.jetski_id) ? (
                          <span>Jetski is currently running. We can&#39;t do any actions to it.</span>
                        ) : (
                          <>
                            <Button onClick={() => handleEditJetskiClick(jetski.jetski_id)}>Edit</Button>
                            <Button className="ml-2" variant="yellow" onClick={() => handleJetskiStatusClick(jetski.jetski_id)}>
                              {jetski.jetski_status === 'AVAILABLE' ? 'Send for repair' : 'Return from repair'}
                            </Button>
                            <Button className="ml-2" variant="destructive" onClick={() => handleJetskiRemoveClick(jetski.jetski_id)}>
                              Remove
                            </Button>
                          </>
                        )
                      ) : (
                        <span>Jetski has been decommissioned. </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-center">
            <Button variant="ghost" onClick={handleGoBack}>
              Go back
            </Button>
          </div>
          {error && <div className="text-red-500">{`Error: ${error}`}</div>}
        </div>
      </div>
    </div>
  );
};
