import ManageBooking from "./ManageBooking";

export default async function GererPage({ searchParams }) {
  const params = await searchParams;
  const token = params?.token || null;

  return <ManageBooking token={token} />;
}
