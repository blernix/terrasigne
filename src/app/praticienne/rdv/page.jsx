import PraticienneManage from "./PraticienneManage";

export const metadata = {
  title: "Gérer un rendez-vous",
  description: "Espace praticienne.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function PraticiennePage({ searchParams }) {
  const params = await searchParams;
  return (
    <PraticienneManage
      token={params?.token || null}
      sig={params?.sig || null}
    />
  );
}
