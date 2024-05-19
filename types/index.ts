import { Reservation, Jetski, Location, UserStatus, UserRole } from "@prisma/client";

export type ExtendedReservation = Reservation & {
  reservation_jetski_list: Jetski[];
  reservation_location: Location;
};

export interface User {
  user_id: string;
  name: string | null;
  email: string | null;
  password: string | null;
  user_status: UserStatus;
  user_role: UserRole;
  user_location_id: number | null;
}