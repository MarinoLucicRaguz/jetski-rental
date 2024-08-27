//povlacenje pocetnog vremena i vremena kraja
import { ExtendedReservation } from '@/types';
import moment from 'moment-timezone';

export const GetTimetableHours = () => {
  const startingTime = moment('09:30', 'HH:mm');
  const endTime = moment('19:30', 'HH:mm');

  const timeSlots = [];

  while (startingTime <= endTime) {
    timeSlots.push(startingTime.clone().format('HH:mm'));
    startingTime.add(15, 'minutes');
  }

  return timeSlots;
};

export const getReservationInformation = (reservation: ExtendedReservation | undefined) => {
  if (!reservation) {
    return 'Nisu dohvaćene informacije o rezervaciji.';
  }
  const duration = moment.duration(moment(reservation.endTime).diff(moment(reservation.startTime)));

  const hours = duration.hours();
  const minutes = duration.minutes();

  let formattedDuration = '';

  if (hours > 0) {
    formattedDuration += `${hours}h`;
  }

  if (minutes > 0) {
    formattedDuration += `${hours > 0 ? ' ' : ''}${minutes}min`;
  }

  return `${moment(reservation.startTime).format('HH:mm')}-${moment(reservation.endTime).format('HH:mm')} ${reservation.reservation_jetski_list.length}x ${formattedDuration} ${reservation.reservation_location.location_name}`;
};

export const isReservationContained = (reservation: ExtendedReservation, slot: string) => {
  const slotTime = moment(slot, 'HH:mm');
  const isContained = slotTime.isAfter(reservation?.startTime) && slotTime.isBefore(reservation?.endTime);

  return isContained;
};
