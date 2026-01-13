export function normalizeHost(hostRaw: string): string {
  const host = (hostRaw || "").toLowerCase().trim();

  // remove protocol if user pasted it (frontend convenience)
  const noProtocol = host.replace(/^https?:\/\//, "");

  // remove path/query/hash if user pasted full URL
  const noPath = noProtocol.split("/")[0];

  // remove port
  const noPort = noPath.split(":")[0];

  // remove trailing dot
  const noDot = noPort.endsWith(".") ? noPort.slice(0, -1) : noPort;

  // remove leading www.
  return noDot.startsWith("www.") ? noDot.slice(4) : noDot;
}
