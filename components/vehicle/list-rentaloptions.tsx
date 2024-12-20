'use client';

import { useEffect, useState } from 'react';
import { getAllRentalOptions } from '@/actions/listReservationOptions';
import { deleteRentalOption } from '@/actions/rentaloptionActions/deleteRentalOption';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Button } from '../atoms/button';
import { useRouter } from 'next/navigation';
import { RentalOptions } from '@prisma/client';
import { FormError } from '../form-error';

type rentalOptionSortBy = 'rentaloption_description' | 'duration' | 'rentalprice' | 'isAvailable';

export const ListRentalOptions = () => {
  const [error, setError] = useState<string | undefined>('');
  const [rentalOptionsData, setRentalOptionsData] = useState<RentalOptions[] | null>([]);
  const [showUnavailable, setShowUnavailable] = useState(true);
  const [sortBy, setSortBy] = useState<rentalOptionSortBy>('duration');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const router = useRouter();
  const user = useCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllRentalOptions();
        setRentalOptionsData(data);
      } catch (error) {
        setError('Error fetching rental options');
      }
    };

    fetchData();
  }, [showUnavailable]);

  const handleGoBack = () => {
    router.back();
  };

  const handleEditClick = (rentaloption_id: number) => {
    router.push(`/rentaloptions/${rentaloption_id}/editrentaloption`);
  };

  const handleDeleteClick = async (rentaloption_id: number) => {
    try {
      const response = await deleteRentalOption(rentaloption_id);

      if (response.success) {
        setRentalOptionsData(
          (prevData) =>
            prevData?.map((option) => {
              if (option.rentaloption_id === rentaloption_id) {
                return {
                  ...option,
                  isAvailable: !option.isAvailable,
                };
              }
              return option;
            }) || null
        );
      } else {
        setError(response.error);
      }
    } catch (error) {
      setError('Error deleting rental option');
    }
  };

  const handleSort = (key: rentalOptionSortBy) => {
    if (sortBy === key) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const sortedRentalOptions = rentalOptionsData?.sort((a, b) => {
    const aValue = a[sortBy as keyof RentalOptions];
    const bValue = b[sortBy as keyof RentalOptions];

    if (aValue === bValue) return 0;

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="p-10 bg-white rounded-sm">
      <div className="text-center text-2xl font-bold uppercase text-black">Rental Options</div>
      <div className="text-right p-2">
        <Button onClick={() => setShowUnavailable(!showUnavailable)}>
          {showUnavailable ? 'Hide unavailable rental options' : 'Show unavailable rental options'}
        </Button>
      </div>
      <table className="w-full text-sm text-left text-gray-500 divide-y">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('rentaloption_description')}>
              Type of Rental
            </th>
            <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('duration')}>
              Duration
            </th>
            <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('isAvailable')}>
              Availability
            </th>
            <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('rentalprice')}>
              Price
            </th>
            {user?.role === 'ADMIN' && <th className="px-6 py-3 text-center">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y">
          {sortedRentalOptions?.map(
            (rental) =>
              (!showUnavailable || rental.isAvailable === true) && (
                <tr key={rental.rentaloption_id}>
                  <td className="px-4 py-2">{rental.rentaloption_description}</td>
                  <td className="px-4 py-2">{rental.duration} minutes</td>
                  <td className="px-4 py-2">{rental.isAvailable ? 'Available' : 'Not available'}</td>
                  <td className="px-4 py-2">{rental.rentalprice.toPrecision(3)} €</td>
                  {user?.role === 'ADMIN' && (
                    <td className="px-4 py-2">
                      <Button onClick={() => handleEditClick(rental.rentaloption_id)}>Edit</Button>
                      {rental.isAvailable === true ? (
                        <Button className="ml-2 w-60" variant="destructive" onClick={() => handleDeleteClick(rental.rentaloption_id)}>
                          Disallow rental option
                        </Button>
                      ) : (
                        <Button className="ml-2 w-60" variant="constructive" onClick={() => handleDeleteClick(rental.rentaloption_id)}>
                          Allow rental option
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              )
          )}
        </tbody>
      </table>
      <div className="mt-4 text-center">
        <FormError message={error} />
      </div>
      <div className="mt-4 flex justify-center">
        <Button variant="ghost" onClick={handleGoBack}>
          Go back
        </Button>
      </div>
    </div>
  );
};
