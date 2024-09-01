'use client';

import { EditJetSkiReservationForm } from '@/components/vehicle/edit-reservation';
import { useParams } from 'next/navigation';

const EditReservationPage = () => {
  const { reservationId } = useParams();

  const parsedReservationId = Array.isArray(reservationId) ? parseInt(reservationId[0], 10) : parseInt(reservationId, 10);
  return <EditJetSkiReservationForm reservationId={parsedReservationId} />;
};

export default EditReservationPage;
