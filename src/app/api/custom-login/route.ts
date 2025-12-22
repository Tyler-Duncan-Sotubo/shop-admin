import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  try {
    // Call backend login directly
    const loginRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const payload = await loginRes.json();

    if (
      (payload.message && payload.message === "Invalid email or password") ||
      payload.message === "Invalid credentials"
    ) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (payload.status === "verification_required") {
      return NextResponse.json(
        {
          requiresVerification: true,
          tempToken: payload.tempToken,
        },
        { status: 200 }
      );
    }

    if (!payload.user || !payload.backendTokens) {
      return NextResponse.json(
        { error: "Invalid response from backend" },
        { status: 400 }
      );
    }
    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
