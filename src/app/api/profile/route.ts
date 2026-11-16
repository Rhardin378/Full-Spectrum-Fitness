import { NextResponse } from "next/server";
import { getProfile } from "@/lib/profile/actions";

export async function GET() {
  const result = await getProfile();

  if (!result.success) {
    return NextResponse.json({ message: result.message }, { status: 500 });
  }

  if (!result.userId) {
    return NextResponse.json(
      { message: "You must be signed in to access your profile." },
      { status: 401 },
    );
  }

  return NextResponse.json({ profile: result.profile }, { status: 200 });
}
