'use client';

import { GetTimetableHours, getReservationInformation } from '@/lib/hoursTimetable';
import { ExtendedReservation } from '@/types';
import { Jetski, Location } from '@prisma/client';
import React from 'react';
import moment from 'moment';

interface ReservationDashboardTimetable {
  reservations: ExtendedReservation[];
  locations: Location[];
  jetskis: Jetski[];
}

const timeslots = GetTimetableHours();
const interval = 15; // Interval in minutes

function ReservationCard({ jetskis, reservations, locations }: ReservationDashboardTimetable) {
  const jetskisByLocation = locations.map((location) => ({
    locationName: location.location_name,
    locationId: location.location_id,
    jetskis: jetskis.filter((jetski) => jetski.jetski_location_id === location.location_id),
  }));

  const getCellContent = (jetski: Jetski, time: string) => {
    const timeSlotStart = moment(time, 'HH:mm');
    const timeSlotEnd = timeSlotStart.clone().add(interval, 'minutes');

    const relevantReservations = reservations
      .filter((reservation) => reservation.reservation_jetski_list.some((rJetski) => rJetski.jetski_id === jetski.jetski_id))
      .filter((reservation) => {
        const startTime = moment(reservation.startTime, 'HH:mm');
        const endTime = moment(reservation.endTime, 'HH:mm');
        return timeSlotStart.isBefore(endTime) && timeSlotEnd.isAfter(startTime);
      });

    if (relevantReservations.length > 0) {
      const reservation = relevantReservations[0];
      const startTime = moment(reservation.startTime, 'HH:mm');
      const endTime = moment(reservation.endTime, 'HH:mm');
      const timeSlotStart = moment(time, 'HH:mm');
      const timeSlotEnd = timeSlotStart.clone().add(interval, 'minutes');
      const coveredStart = timeSlotStart.isBefore(startTime) ? startTime : timeSlotStart;
      const coveredEnd = timeSlotEnd.isAfter(endTime) ? endTime : timeSlotEnd;
      const coveredDuration = moment.duration(coveredEnd.diff(coveredStart));
      const coveredMinutes = coveredDuration.asMinutes();
      const colspan = Math.ceil(coveredMinutes / interval);
      console.log(`Reservation ${reservation.reservation_id} covers ${coveredMinutes} minutes of the slot. Colspan: ${colspan}`);
      return { reservation, colspan };
    }
    return null;
  };

  return (
    <div className="rounded-lg">
      <div className="grid grid-cols-1 shadow-lg">
        {jetskisByLocation.map((group) => (
          <div key={group.locationId} className="bg-white rounded-md mb-4">
            <h2 className="text-xl text-center font-bold m-2">{group.locationName} - Raspored</h2>
            <div className="overflow-x-auto">
              <table className="table-auto w-full min-w-[600px] sm:min-w-[768px] md:min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-1 py-2 sticky left-0 bg-white z-10"></th>
                    {timeslots.map((time) => (
                      <th key={time} className="px-1 py-1 text-center border-2 border-gray-400">
                        {time}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.jetskis.map((jetski) => {
                    const cells: JSX.Element[] = [];
                    let currentTimeIndex = 0;

                    const ongoingReservations = new Map<number, { reservation: ExtendedReservation; colspan: number }>();

                    while (currentTimeIndex < timeslots.length) {
                      const time = timeslots[currentTimeIndex];
                      const cellContent = getCellContent(jetski, time);

                      if (cellContent) {
                        const { reservation, colspan } = cellContent;
                        if (ongoingReservations.has(reservation.reservation_id)) {
                          const existing = ongoingReservations.get(reservation.reservation_id)!;
                          existing.colspan += colspan;
                          cells[cells.length - 1] = (
                            <td
                              key={time}
                              colSpan={existing.colspan}
                              className="relative px-1 py-2 border border-gray-300 bg-blue-500 text-white text-center"
                              style={{ borderRight: '0px', borderBottom: '0px' }}
                            >
                              {getReservationInformation(reservation)}
                            </td>
                          );
                        } else {
                          ongoingReservations.set(reservation.reservation_id, { reservation, colspan });
                          cells.push(
                            <td
                              key={time}
                              colSpan={colspan}
                              className="relative px-1 py-2 border border-gray-300 bg-blue-500 text-white text-center"
                              style={{ borderRight: '0px', borderBottom: '0px' }}
                            >
                              {getReservationInformation(reservation)}
                            </td>
                          );
                        }

                        currentTimeIndex += colspan;
                      } else {
                        cells.push(
                          <td key={time} className="px-1 py-2 border border-gray-300">
                            {}
                          </td>
                        );
                        currentTimeIndex++;
                      }
                    }

                    return (
                      <tr key={jetski.jetski_id}>
                        <th className="px-1 py-4 border-2 border-gray-400 bg-white sticky left-0 z-10">{jetski.jetski_registration}</th>
                        {cells}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReservationCard;
