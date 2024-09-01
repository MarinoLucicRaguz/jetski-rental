'use client';
import { EditJetskiForm } from '@/components/vehicle/edit-jetski';
import { useParams } from 'next/navigation';

const EditJetskiPage = () => {
  const { jetskiId } = useParams();

  const parsedJetskiID = Array.isArray(jetskiId) ? parseInt(jetskiId[0], 10) : parseInt(jetskiId, 10);
  return <EditJetskiForm jetskiId={parsedJetskiID} />;
};

export default EditJetskiPage;
