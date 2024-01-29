import { CreateJetskiButton } from "@/components/auth/create-jetski-button"
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { CreateReservationButton } from "@/components/auth/create-reservation-button";
import { CreateLocationButton } from "@/components/auth/create-location-button";

const DashboardPage =async ()=>{
    const session = await auth()

    return (
        <main className="flex h-full flex-col items-center justify-top bg-sky-500">
            <div className="flex justify-between w-full p-4">
                <div className="bg-white rounded-sm text-center w-full margin-right-5">
                    Welcome to the dashboard
                </div>
                <CreateJetskiButton>
                    <Button className="w-full margin-right-5" type="submit" variant="secondary">
                        Add a jetski
                    </Button>
                </CreateJetskiButton>
                {/* //todo */}
                <CreateJetskiButton>
                    <Button className="w-full margin-right-5" type="submit" variant="secondary">
                        List of jetskis
                    </Button>
                </CreateJetskiButton>
                <CreateLocationButton>
                    <Button className="w-full margin-right-5" type="submit" variant="secondary">
                        Create a location
                    </Button>
                </CreateLocationButton>
                <CreateJetskiButton>
                    <Button className="w-full margin-right-5" type="submit" variant="secondary">
                        List of location
                    </Button>
                </CreateJetskiButton>
                <CreateReservationButton>
                    <Button className="w-full margin-right-5" type="submit" variant="secondary">
                        Create a reservation
                    </Button>
                </CreateReservationButton>
                <form action={async ()=>{
                    "use server";
                    
                    await signOut();
                }}>
                    <Button className="w-full margin-right-5" type="submit" variant="secondary">
                        Sign out
                    </Button>
                </form>                
                
            </div>
        </main>
    )
}

export default DashboardPage;