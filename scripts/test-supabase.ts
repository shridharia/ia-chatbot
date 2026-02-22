/**
 * Quick Supabase connection test.
 * Run: npx tsx scripts/test-supabase.ts
 */

import { config } from "dotenv";
import * as path from "path";

config({ path: path.join(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function test() {
  console.log("Supabase URL:", url ? `${url.slice(0, 40)}...` : "(missing)");
  console.log("Service key:", key ? "set" : "(missing)");

  if (!url || !key) {
    console.error("\nMissing env vars. Check .env.local");
    process.exit(1);
  }

  console.log("\nTesting raw fetch to Supabase...");
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    console.log("Status:", res.status, res.statusText);
    if (res.ok) {
      console.log("OK - Supabase is reachable.");
    } else {
      const text = await res.text();
      console.log("Response:", text.slice(0, 200));
    }
  } catch (err) {
    console.error("Fetch failed:", err);
    if (err instanceof Error && err.cause) {
      console.error("Cause:", err.cause);
    }
    console.error("\nLikely causes:");
    console.error("- Supabase project is PAUSED. Go to supabase.com/dashboard, open your project, click Restore.");
    console.error("- Firewall/VPN blocking supabase.co");
    console.error("- Wrong URL in .env.local");
    process.exit(1);
  }
}

test();
