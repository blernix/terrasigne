const DIRECTUS_API = process.env.NEXT_PUBLIC_DIRECTUS_API;
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

interface DirectusServicePdf {
  id: string;
  filename_download: string;
  filename_disk: string;
  type: string;
}

interface DirectusService {
  id: number;
  titre: string;
  description: string;
  prix: number | null;
  duree: number | null;
  pause: number | null;
  rendez_vous: boolean;
  pdf: DirectusServicePdf | null;
}

export async function fetchService(serviceId: string): Promise<DirectusService> {
  const res = await fetch(
    `${DIRECTUS_API}/items/services/${serviceId}?fields=id,titre,description,prix,duree,pause,rendez_vous,pdf.id,pdf.filename_download,pdf.filename_disk,pdf.type`,
    {
      headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error(`Directus error ${res.status}`);

  const { data } = await res.json();
  return data;
}

export function getDirectusFileUrl(filenameDisk: string): string {
  return `${process.env.NEXT_PUBLIC_DIRECTUS_STORAGE}/uploads/${filenameDisk}`;
}
