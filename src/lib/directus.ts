const DIRECTUS_API = process.env.NEXT_PUBLIC_DIRECTUS_API;
const DIRECTUS_TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;

interface DirectusService {
  id: number;
  titre: string;
  description: string;
  prix: number | null;
  duree: number | null;
  pause: number | null;
  rendez_vous: boolean;
}

export async function fetchService(serviceId: string): Promise<DirectusService> {
  const res = await fetch(
    `${DIRECTUS_API}/items/services/${serviceId}?fields=id,titre,description,prix,duree,pause,rendez_vous`,
    {
      headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error(`Directus error ${res.status}`);

  const { data } = await res.json();
  return data;
}
