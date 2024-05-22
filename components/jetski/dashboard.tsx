"use client";

import ReservationCard from "@/components/ui/reservationcard";
import { useEffect, useState } from "react";
import { Location } from "@prisma/client";
import { listLocation } from "@/actions/listLocations";
import Spinner from "../ui/spinner";
import AvailabilityFormModal from "../modal/availabilityForm";
import { Button } from "../ui/button";

export const DashboardPage = () => {
  const [locations, setLocations] = useState<Location[] | null>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const locationData = await listLocation();
        setLocations(locationData);
      } catch (error) {
        setError("Failed to fetch location");
        console.error(error);
      }
    };

    fetchLocation();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
        <header className="py-4">
        <div className="container mx-auto text-center text-white font-bold text-xl">
          DASHBOARD
        </div>
      </header>
      <div className="flex-grow flex items-center justify-center bg-sky-500 h-full p-6">
            {locations && locations.length>0 ? (
                locations.map((location)=>(
                    <div key={location.location_id} className="m-4">
                        <ReservationCard location={location} />
                    </div>
                ))
            ) : (
                <div className="text-red-500">{error || <Spinner/>}</div>
            )}
        </div>
        <div className="absolute top-4 right-4">
            <Button onClick={handleOpenModal}>Check Availability</Button>
        </div>
        {isModalOpen && (
            <AvailabilityFormModal onClose={handleCloseModal} />
        )}
    </div>
  );
};

export default DashboardPage;
