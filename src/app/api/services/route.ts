import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const featured = url.searchParams.get("featured") === "true";

    let filterQuery = "&filter[status][_eq]=published";

    if (featured) {
      filterQuery += `&filter[accueil][_eq]=true`;
    }

    const [servicesRes, formulesRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_DIRECTUS_API}/items/services?fields=id,titre,description,prix,rendez_vous,duree,pause,categorie_id.titre,categorie_id.description,categorie_id.couverture.filename_disk,status${filterQuery}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}`,
          },
        }
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_DIRECTUS_API}/items/formule?fields=id,titre,duree,pause,prix,service_id&filter[status][_eq]=published&limit=-1`,
        {
          headers: {
            Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}`,
          },
        }
      ),
    ]);

    if (!servicesRes.ok) {
      throw new Error(`Erreur API services: ${servicesRes.status}`);
    }
    if (!formulesRes.ok) {
      throw new Error(`Erreur API formules: ${formulesRes.status}`);
    }

    const servicesData = await servicesRes.json();
    const formulesData = await formulesRes.json();

    const formulesByService = new Map<string, any[]>();
    for (const f of formulesData.data || []) {
      const serviceId = f.service_id;
      if (!serviceId) continue;
      if (!formulesByService.has(serviceId)) formulesByService.set(serviceId, []);
      formulesByService.get(serviceId)!.push({
        id: f.id,
        titre: f.titre,
        duree: Number(f.duree),
        pause: Number(f.pause || 0),
        prix: f.prix != null ? Number(f.prix) : null,
      });
    }

    const formattedServices = (servicesData.data || []).map((service: any) => {
      const formules = formulesByService.get(service.id) || [];
      const resolvedFormules = formules.length
        ? formules
        : service.duree
        ? [
            {
              id: null,
              titre: `${service.duree} min`,
              duree: Number(service.duree),
              pause: Number(service.pause || 0),
              prix: service.prix != null ? Number(service.prix) : null,
            },
          ]
        : [];

      return {
        id: service.id,
        titre: service.titre,
        description: service.description,
        prix: service.prix,
        rendez_vous: service.rendez_vous,
        duree: service.duree,
        pause: service.pause,
        status: service.status,
        formules: resolvedFormules,
        categorie: {
          titre: service.categorie_id?.titre || "Sans catégorie",
          description: service.categorie_id?.description || "",
          couverture: service.categorie_id?.couverture?.filename_disk
            ? `${process.env.NEXT_PUBLIC_DIRECTUS_STORAGE}/uploads/${service.categorie_id.couverture.filename_disk}`
            : "/images/default-cover.jpg",
        },
      };
    });

    return NextResponse.json(formattedServices);
  } catch (error) {
    console.error("Erreur lors de la récupération des services :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
