import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PERMISSIONS } from "../permissions";

/** The backend owns permissions. This fails if the frontend constants drift from `ops-pilot-backend/app/rbac.py`. */
const backend = join(process.cwd(), "..", "ops-pilot-backend", "app", "rbac.py");

describe.skipIf(!existsSync(backend))("permission strings match the backend", () => {
  const source = existsSync(backend) ? readFileSync(backend, "utf8") : "";
  const server = new Set([...source.matchAll(/"((?:[a-z]+):(?:[a-z]+):(?:[a-z]+))"/g)].map((m) => m[1]));

  it("every frontend permission exists on the backend", () => {
    for (const [name, value] of Object.entries(PERMISSIONS)) expect(server.has(value), `${name}: ${value}`).toBe(true);
  });
  it("every backend permission is known to the frontend", () => {
    const known = new Set<string>(Object.values(PERMISSIONS));
    for (const value of server) expect(known.has(value), `backend-only permission: ${value}`).toBe(true);
  });
});
