import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import axios from "axios";
import { authOptions } from "@/lib/auth/auth-options";

type PresignReq = {
  files: Array<{ fileName: string; mimeType: string }>;
  storeId?: string;
  folder?: string; // optional: "categories"
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.backendTokens.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as PresignReq;

  const { data } = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media/presign`,
    body,
    {
      headers: { Authorization: `Bearer ${session.backendTokens.accessToken}` },
    }
  );

  return NextResponse.json(data);
}
