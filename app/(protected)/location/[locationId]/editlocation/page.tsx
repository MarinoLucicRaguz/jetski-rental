import { EditLocationForm } from "@/components/jetski/edit-location";
import { useParams } from "next/navigation";

const EditLocationPage = () => {
    const { locationId } = useParams(); // Extract locationId from the URL
    return (
        <EditLocationForm locationId={locationId} /> // Pass locationId as a prop to EditLocationForm
    );
};

export default EditLocationPage;
