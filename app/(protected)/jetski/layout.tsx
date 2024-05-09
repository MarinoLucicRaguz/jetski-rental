import { signOut } from "@/auth"
import { CreateJetskiButton } from "@/components/auth/create-jetski-button"
import { CreateLocationButton } from "@/components/auth/create-location-button"
import { CreateReservationButton } from "@/components/auth/create-reservation-button"
import { CreateReservationOptionButton } from "@/components/auth/create-reservation-option-button"
import { ListJetskiButton } from "@/components/auth/list-jetski-button"
import { ListLocationButton } from "@/components/auth/list-locations-button"
import { ListRentalOptionsButton } from "@/components/auth/list-rental-options-button"
import { ListReservationButton } from "@/components/auth/list-reservation-button"
import { Button } from "@/components/ui/button"

const AuthLayout =({children}:{
    children: React.ReactNode
}) => {
    return (
        <main className="flex h-full w-full">
            <div className="sticky top-0 flex flex-col w-64 bg-sky-700 border-2 border-black h-screen overflow-auto"> {/* Ensure full height */}
                <div className="flex justify-center items-center h-44 border-b-2 border-black"> {/* Added border for separation */}
                    <img src="/jetski_transp.png" alt="Jetski Logo" className="w-44" /> {/* Adjusted for no specific height */}
                </div>
                <div className="text-white text-xl font-bold p-2 bg-sky-800 rounded-md mb-5">
                    NAVIGATION MENU:
                </div>
                <div className="overflow-auto flex-grow"> {/* Makes only this part scrollable */}
                    <CreateJetskiButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            Add a jetski
                        </Button>
                    </CreateJetskiButton>
                    <ListJetskiButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            List of jetskis
                        </Button>
                    </ListJetskiButton>
                    <CreateLocationButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            Create a location
                        </Button>
                    </CreateLocationButton>
                    <ListLocationButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            List of locations
                        </Button>
                    </ListLocationButton>
                    <CreateReservationOptionButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            Add rental option
                        </Button>
                    </CreateReservationOptionButton>
                    <ListRentalOptionsButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            List rental options 
                        </Button>
                    </ListRentalOptionsButton>
                    <CreateReservationButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            Create a reservation
                        </Button>
                    </CreateReservationButton>
                    <ListReservationButton>
                        <Button className="w-full mb-3" type="submit" variant="secondary">
                            List of reservations
                        </Button>
                    </ListReservationButton>
                    <form onSubmit={async () => {
                        "use server";
                        await signOut();
                    }}>
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

export default AuthLayout;