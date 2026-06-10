const backendUrl = process.env.API_PROXY_TARGET ?? process.env.VITE_API_BASE_URL;

async function readBody(request) {
  if (request.body !== undefined) {
    if (Buffer.isBuffer(request.body)) return request.body;
    if (typeof request.body === "string") return Buffer.from(request.body);
    return Buffer.from(JSON.stringify(request.body));
  }

  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function buildTargetUrl(request) {
  if (!backendUrl) {
    throw new Error("API_PROXY_TARGET or VITE_API_BASE_URL is required.");
  }

  const path = Array.isArray(request.query.path)
    ? request.query.path.join("/")
    : request.query.path;
  const target = new URL(`/api/${path ?? ""}`, backendUrl);

  for (const [key, value] of Object.entries(request.query)) {
    if (key === "path") continue;

    if (Array.isArray(value)) {
      value.forEach((item) => target.searchParams.append(key, item));
      continue;
    }

    if (value !== undefined) {
      target.searchParams.set(key, value);
    }
  }

  return target;
}

export default async function handler(request, response) {
  try {
    const target = buildTargetUrl(request);
    const headers = new Headers();

    for (const [key, value] of Object.entries(request.headers)) {
      if (!value) continue;
      if (["connection", "content-length", "host", "origin"].includes(key.toLowerCase())) continue;
      headers.set(key, Array.isArray(value) ? value.join(",") : value);
    }

    const body = ["GET", "HEAD"].includes(request.method ?? "")
      ? undefined
      : await readBody(request);

    const upstream = await fetch(target, {
      body,
      headers,
      method: request.method,
      redirect: "manual",
    });

    response.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (["content-encoding", "content-length", "transfer-encoding"].includes(key.toLowerCase())) {
        return;
      }

      response.setHeader(key, value);
    });

    const buffer = Buffer.from(await upstream.arrayBuffer());
    response.send(buffer);
  } catch (error) {
    response.status(500).json({
      message: error instanceof Error ? error.message : "API proxy failed.",
    });
  }
}
