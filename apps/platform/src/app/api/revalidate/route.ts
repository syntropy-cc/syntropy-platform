/**
 * On-demand revalidation for institution pages (COMP-036.1).
 * Call on dip.governance.proposal_executed to revalidate institution pages.
 * Consolidated from institutional-site into platform.
 */

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const headerSecret = request.headers.get("x-revalidate-secret");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const body = await request.json().catch(() => ({})) as { secret?: string; slug?: string };
  const bodySecret = body?.secret;

  const provided =
    headerSecret ?? querySecret ?? bodySecret;

  if (!REVALIDATE_SECRET || provided !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = body?.slug;
  if (slug) {
    revalidatePath(`/institutions/${slug}`);
    revalidatePath(`/institutions/${slug}/projects`);
    revalidatePath(`/institutions/${slug}/legitimacy-chain`);
  } else {
    revalidatePath("/institutions");
  }

  return NextResponse.json({ revalidated: true });
}
