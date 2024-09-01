'use client';
import { EditLocationForm } from '@/components/vehicle/edit-location';
import { useParams } from 'next/navigation';

const EditLocationPage = () => {
  const { locationId } = useParams();
  const parsedLocationId = Array.isArray(locationId) ? parseInt(locationId[0], 10) : parseInt(locationId, 10);
  return <EditLocationForm locationId={parsedLocationId} />;
};

export default EditLocationPage;
