import BookingWizard from "./BookingWizard";

export default async function RendezVousPage({ searchParams }) {
  const params = await searchParams;
  const targetServiceId = params?.service || null;

  return <BookingWizard targetServiceId={targetServiceId} />;
}
