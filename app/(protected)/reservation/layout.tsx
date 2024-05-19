import { signOutUser } from "@/actions/signOutAction"
import { signOut } from "@/auth"
import { AdminDashboardButton } from "@/components/auth/admin-dashboard-button"
import { CreateJetskiButton } from "@/components/auth/create-jetski-button"
import { CreateLocationButton } from "@/components/auth/create-location-button"
import { CreateReservationButton } from "@/components/auth/create-reservation-button"
import { CreateReservationOptionButton } from "@/components/auth/create-reservation-option-button"
import { ListJetskiButton } from "@/components/auth/list-jetski-button"
import { ListLocationButton } from "@/components/auth/list-locations-button"
import { ListRentalOptionsButton } from "@/components/auth/list-rental-options-button"
import { ListReservationButton } from "@/components/auth/list-reservation-button"
import { Button } from "@/components/ui/button"
import { getUserRole } from "@/lib/getUserRole"

const ReservationLayout =async({children}:{
    children: React.ReactNode
}) => {
    const userRole = await getUserRole();

    return (
        <main className="flex h-full w-full">
            <div className="sticky top-0 flex flex-col w-64 bg-sky-700 border-2 border-black h-screen overflow-auto">
                <div className="flex justify-center items-center h-44 border-b-2 border-black">
                    <img src="/jetski_transp.png" alt="Jetski Logo" className="w-44" />
                </div>
                <div className="text-white text-xl font-bold p-2 bg-sky-800 rounded-md mb-5">
                    NAVIGATION MENU:
                </div>
                <div className="overflow-auto flex-grow">
                    {(userRole === "ADMIN" || userRole==="MODERATOR") && (
                    <CreateJetskiButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            Add a jetski
                        </Button>
                    </CreateJetskiButton>
                    )}
                    <ListJetskiButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            List of jetskis
                        </Button>
                    </ListJetskiButton>
                    {(userRole === "ADMIN" || userRole==="MODERATOR") && ( 
                    <CreateLocationButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            Create a location
                        </Button>
                    </CreateLocationButton>
                    )}
                    <ListLocationButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            List of locations
                        </Button>
                    </ListLocationButton>
                    {userRole === "ADMIN" && (
                        <CreateReservationOptionButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            Add rental option
                        </Button>
                    </CreateReservationOptionButton>
                    )}
                    <ListRentalOptionsButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            List rental options 
                        </Button>
                    </ListRentalOptionsButton>
                    {(userRole === "ADMIN" || userRole==="MODERATOR") && (
                        <CreateReservationButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            Create a reservation
                        </Button>
                    </CreateReservationButton>
                    )}
                    <ListReservationButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            List of reservations
                        </Button>
                    </ListReservationButton>
                    {userRole === "ADMIN" && (
                        <AdminDashboardButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            Admin dashboard
                        </Button>
                        </AdminDashboardButton>
                    )}
                    <form action={signOutUser}>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                        Sign out
                        </Button>
                    </form>
                </div>
            </div>
            <div className="flex-grow flex items-center justify-center bg-sky-500 h-full p-10">
                {children}
            </div>
        </main>
    );
}

export default ReservationLayout;