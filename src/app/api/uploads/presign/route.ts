// =====================================
// 1) NEXT.JS API: PRESIGN ENDPOINT
// File: app/api/uploads/presign/route.ts
// =====================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import axios from "axios";
import { authOptions } from "@/lib/auth/auth-options";

type PresignReq = {
  count: number;
  files: Array<{ fileName: string; mimeType: string }>;
  companyId?: string;
  storeId?: string;
  productId?: string;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.backendTokens.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as PresignReq;
  const { data } = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media/products/presign`,
    body,
    {
      headers: { Authorization: `Bearer ${session.backendTokens.accessToken}` },
    }
  );
  return NextResponse.json(data);
}
