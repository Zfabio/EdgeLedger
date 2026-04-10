import { NextRequest, NextResponse } from "next/server";

// Routes all GitHub Gist API calls through a server-side proxy
// to avoid any CORS issues in the browser
export async function GET(req: NextRequest) {
  const gistId = req.nextUrl.searchParams.get("gistId");
  const token = req.headers.get("x-github-token");

  if (!gistId || !token) {
    return NextResponse.json({ error: "Missing gistId or token" }, { status: 400 });
  }

  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "GitHub API error", status: res.status },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const gistId = req.nextUrl.searchParams.get("gistId");
  const token = req.headers.get("x-github-token");
  const body = await req.json();

  if (!gistId || !token) {
    return NextResponse.json({ error: "Missing gistId or token" }, { status: 400 });
  }

  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "GitHub API error", status: res.status },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}
