import { NextResponse } from "next/server";
import { z } from "zod";
import { suggestCategory } from "@/ai/flows";

const bodySchema = z.object({ description: z.string() });

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { description } = bodySchema.parse(json);
    const category = await suggestCategory(description);
    return NextResponse.json({ category });
  } catch (err) {
    return NextResponse.json({ error: "Failed to suggest category" }, { status: 500 });
  }
}
