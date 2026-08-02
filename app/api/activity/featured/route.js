import { getFeatured } from "../_lib/service";

export const dynamic = "force-dynamic";

export async function GET() {
  return getFeatured();
}
