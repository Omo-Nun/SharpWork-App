import { NextRequest, NextResponse } from 'next/server';
import { resolveApiUrl } from './urls';

const SKIP_REQUEST_HEADERS = new Set(['host', 'connection', 'content-length', 'transfer-encoding']);

async function proxyRequest(req: NextRequest, pathSegments: string[] | undefined): Promise<NextResponse> {
  const apiBase = resolveApiUrl();
  const path = pathSegments?.length ? pathSegments.join('/') : '';
  const target = `${apiBase}/${path}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (SKIP_REQUEST_HEADERS.has(key.toLowerCase())) return;
    headers.set(key, value);
  });

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: 'manual',
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch {
    return NextResponse.json(
      { error: 'Unable to reach the API service. Check API_URL or Railway service linking.' },
      { status: 502 }
    );
  }

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path?: string[] }> };

async function withPath(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function GET(req: NextRequest, context: RouteContext) {
  return withPath(req, context);
}

export async function POST(req: NextRequest, context: RouteContext) {
  return withPath(req, context);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return withPath(req, context);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return withPath(req, context);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return withPath(req, context);
}

export async function OPTIONS(req: NextRequest, context: RouteContext) {
  return withPath(req, context);
}
