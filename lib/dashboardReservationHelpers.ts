import { ExtendedReservation } from '@/types';
import { Jetski } from '@prisma/client';

export const getBackgroundColor = (reservation: ExtendedReservation, jetski: Jetski) => {
  const now = new Date();
  const startTime = new Date(reservation.startTime);
  const endTime = new Date(reservation.endTime);

  if (jetski.jetski_status !== 'AVAILABLE') {
    return {
      backgroundColor: 'bg-red-400',
      statusText: "Error: Jetski isn't available",
    };
  }

  const anyJetskiNotAvailable = reservation.reservation_jetski_list.some(
    (jetskiItem) => jetskiItem.jetski_id !== jetski.jetski_id && jetskiItem.jetski_status !== 'AVAILABLE'
  );

  if (anyJetskiNotAvailable) {
    return {
      backgroundColor: 'bg-red-400',
      statusText: "Error: One of the jetskis in reservation isn't available",
    };
  } else if (reservation.isCurrentlyRunning) {
    return {
      backgroundColor: 'bg-green-200',
      statusText: 'Reservation is currently running',
    };
  } else if (now < startTime) {
    return {
      backgroundColor: 'bg-yellow-200',
      statusText: 'Reservation is upcoming',
    };
  } else if (now >= startTime && now <= endTime) {
    return {
      backgroundColor: 'bg-blue-200',
      statusText: 'Reservation is about to start',
    };
  } else if (reservation.hasItFinished || (reservation.endTime <= now && !reservation.isCurrentlyRunning)) {
    return {
      backgroundColor: 'bg-gray-200',
      statusText: 'Reservation has finished',
    };
  } else {
    return { backgroundColor: 'bg-gray-200', statusText: 'Unknown status' };
  }
};

export const calculateDuration = (startTime: Date, endTime: Date) => {
  const duration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000;
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  if (minutes == 0) {
    return `${hours} hours`;
  }
  if (hours == 0) {
    return `${minutes} minutes`;
  }
  return `${hours}h and ${minutes} minutes`;
};

export const getReservationStatusColor = (reservation: ExtendedReservation) => {
  const now = new Date();
  const startTime = new Date(reservation.startTime);

  const hasUnavailableJetski = reservation.reservation_jetski_list?.some((jetski: Jetski) => jetski.jetski_status != 'AVAILABLE');

  if (reservation.isCurrentlyRunning) {
    return 'bg-green-400';
  } else if (reservation.hasItFinished) {
    return 'bg-gray-400';
  } else if (hasUnavailableJetski) {
    return 'bg-red-400';
  } else if (now < startTime || !reservation.isCurrentlyRunning) {
    return 'bg-yellow-400';
  } else {
    return '';
  }
};
