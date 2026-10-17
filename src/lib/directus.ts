import { createSlug } from "@/lib/utils";

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

const REVALIDATE = 300;

async function directusGet(path: string, tags: string[] = []): Promise<any> {
  const res = await fetch(`${DIRECTUS_API}${path}`, {
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
    next: { revalidate: REVALIDATE, tags },
  });
  if (!res.ok) throw new Error(`Directus ${res.status} sur ${path}`);
  const json = await res.json();
  return json.data;
}

function cover(filename?: string, fallback = "/images/default-cover.jpg") {
  return filename ? getDirectusFileUrl(filename) : fallback;
}

export async function getCarrousel() {
  return directusGet(
    "/items/carrousel?fields=id,images.id,images.filename_disk,images.title",
    ["carrousel"]
  );
}

export async function getFeaturedServices() {
  const services = await directusGet(
    "/items/services?fields=id,titre,description,prix,categorie_id.titre&filter[status][_eq]=published&filter[accueil][_eq]=true",
    ["services"]
  );

  return (services || []).map((s: any) => ({
    id: s.id,
    titre: s.titre,
    description: s.description,
    prix: s.prix,
    categorie: { titre: s.categorie_id?.titre || "Sans catégorie" },
  }));
}

async function getFormattedServices() {
  const [services, formules] = await Promise.all([
    directusGet(
      "/items/services?fields=id,titre,description,prix,rendez_vous,duree,pause,mode_rdv,categorie_id.titre,categorie_id.description,categorie_id.couverture.filename_disk,status&filter[status][_eq]=published",
      ["services"]
    ),
    directusGet(
      "/items/formule?fields=id,titre,duree,pause,prix,service_id&filter[status][_eq]=published&limit=-1",
      ["services"]
    ),
  ]);

  const formulesByService = new Map<string, any[]>();
  for (const f of formules || []) {
    if (!f.service_id) continue;
    if (!formulesByService.has(f.service_id)) formulesByService.set(f.service_id, []);
    formulesByService.get(f.service_id)!.push({
      id: f.id,
      titre: f.titre,
      duree: Number(f.duree),
      pause: Number(f.pause || 0),
      prix: f.prix != null ? Number(f.prix) : null,
    });
  }

  return (services || []).map((s: any) => {
    const list = formulesByService.get(s.id) || [];
    const resolved = list.length
      ? list
      : s.duree
      ? [
          {
            id: null,
            titre: `${s.duree} min`,
            duree: Number(s.duree),
            pause: Number(s.pause || 0),
            prix: s.prix != null ? Number(s.prix) : null,
          },
        ]
      : [];

    return {
      id: s.id,
      titre: s.titre,
      slug: createSlug(s.titre),
      description: s.description,
      prix: s.prix,
      rendez_vous: s.rendez_vous,
      duree: s.duree,
      pause: s.pause,
      mode_rdv: Array.isArray(s.mode_rdv) ? s.mode_rdv : [],
      status: s.status,
      formules: resolved,
      categorie: {
        titre: s.categorie_id?.titre || "Sans catégorie",
        description: s.categorie_id?.description || "",
        couverture: cover(s.categorie_id?.couverture?.filename_disk),
      },
    };
  });
}

export async function getServiceCategories() {
  const formatted = await getFormattedServices();

  const grouped: Record<string, any> = {};
  formatted.forEach((s: any) => {
    const cat = s.categorie.titre;
    if (!grouped[cat]) {
      grouped[cat] = {
        category: cat,
        description: s.categorie.description || "Pas de description disponible.",
        couverture: s.categorie.couverture,
        services: [],
      };
    }
    grouped[cat].services.push(s);
  });

  return Object.keys(grouped).map((title) => {
    const data = grouped[title];
    data.slug = createSlug(title);
    return data;
  });
}

export async function getServiceSlugs(): Promise<string[]> {
  const formatted: any[] = await getFormattedServices();
  const slugs = formatted.map((s) => String(s.slug));
  return Array.from(new Set(slugs));
}

export async function getServiceBySlug(slug: string) {
  const formatted = await getFormattedServices();
  return formatted.find((s: any) => s.slug === slug) || null;
}

export async function getArticles(
  options: { featured?: boolean; category?: string; search?: string } = {}
) {
  let filter = "&filter[status][_eq]=published";
  if (options.featured) filter += "&filter[accueil][_eq]=true";
  if (options.category) filter += `&filter[categorie_id][_eq]=${options.category}`;
  if (options.search) filter += `&filter[titre][_contains]=${encodeURIComponent(options.search)}`;

  const data = await directusGet(
    `/items/articles?fields=id,titre,contenu,date_created,categorie_id.titre,photo_couverture.filename_disk${filter}`,
    ["articles"]
  );

  return (data || []).map((a: any) => ({
    id: a.id,
    titre: a.titre,
    contenu: a.contenu,
    date_created: a.date_created,
    categorie: a.categorie_id?.titre || "Sans catégorie",
    couverture: a.photo_couverture?.filename_disk
      ? cover(a.photo_couverture.filename_disk, "/images/hero_blog.jpg")
      : undefined,
  }));
}

export async function getArticleCategories() {
  return directusGet("/items/categories_articles?fields=id,titre", ["categories"]);
}

export async function getArticle(id: string) {
  const a = await directusGet(
    `/items/articles/${id}?fields=id,titre,contenu,categorie_id.titre,date_created,date_updated,photo_couverture.filename_disk,status`,
    ["articles"]
  );

  if (!a || a.status !== "published") return null;

  return {
    id: a.id,
    titre: a.titre,
    contenu: a.contenu,
    categorie: a.categorie_id?.titre || "Sans catégorie",
    date_created: a.date_created,
    date_updated: a.date_updated,
    couverture: a.photo_couverture?.filename_disk
      ? cover(a.photo_couverture.filename_disk, "/images/hero_blog.jpg")
      : undefined,
  };
}

export async function getArticleIds(): Promise<string[]> {
  const data = await directusGet(
    "/items/articles?fields=id&filter[status][_eq]=published&limit=-1",
    ["articles"]
  );
  return (data || []).map((a: any) => String(a.id));
}
