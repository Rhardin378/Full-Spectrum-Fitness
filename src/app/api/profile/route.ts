import { NextResponse } from "next/server";
import { getOrCreateProfile } from "@/lib/profile/actions";

export async function GET() {
  const result = await getOrCreateProfile();

  if (!result.success) {
    if (result.error === "unauthorized") {
      return NextResponse.json({ message: result.message }, { status: 401 });
    }

    return NextResponse.json({ message: result.message }, { status: 500 });
  }

  return NextResponse.json({ profile: result.profile }, { status: 200 });
}
