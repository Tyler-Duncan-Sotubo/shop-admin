import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import axios from "axios";
import { authOptions } from "@/lib/auth/auth-options";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.backendTokens?.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { data } = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media/finalize`,
    body,
    {
      headers: {
        Authorization: `Bearer ${session.backendTokens.accessToken}`,
      },
    }
  );

  return NextResponse.json(data);
}
