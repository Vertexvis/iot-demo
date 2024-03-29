import type { Environment } from "@vertexvis/viewer";

export interface StreamCredentials {
  readonly clientId: string;
  readonly streamKey: string;
}

// Wind turbine
export const DefaultCredentials: StreamCredentials = {
  clientId: "08F675C4AACE8C0214362DB5EFD4FACAFA556D463ECA00877CB225157EF58BFA",
  streamKey: "OHCC5wLnH9SISYJQcaprKZrSbhKU7FSmBAea",
};

export const Env =
  (process.env.NEXT_PUBLIC_VERTEX_ENV as Environment) || "platprod";

export function head<T>(items?: T | T[]): T | undefined {
  return items ? (Array.isArray(items) ? items[0] : items) : undefined;
}
export function encodeCreds(cs: StreamCredentials): string {
  return `/?clientId=${encodeURIComponent(
    cs.clientId
  )}&streamKey=${encodeURIComponent(cs.streamKey)}`;
}
