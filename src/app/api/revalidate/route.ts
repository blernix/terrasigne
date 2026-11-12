import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

const DEFAULT_TAGS = ["articles", "services", "carrousel", "categories"];
const DEFAULT_PATHS = ["/", "/blog", "/services"];

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret =
    url.searchParams.get("secret") || req.headers.get("x-revalidate-secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  let body: { tags?: string[]; paths?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const tags = body.tags?.length ? body.tags : DEFAULT_TAGS;
  const paths = body.paths?.length ? body.paths : DEFAULT_PATHS;

  tags.forEach((tag) => revalidateTag(tag));
  paths.forEach((path) => revalidatePath(path));

  return NextResponse.json({ revalidated: true, tags, paths });
}
