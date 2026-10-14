import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { publicEnv, serverEnv } from "@/lib/env";

/** Cliente con la sesión del usuario (respeta RLS). Solo servidor. */
export async function createSessionClient() {
  const env = publicEnv();
  const cookieStore = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => {
        try {
          items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // En Server Components no se pueden escribir cookies; el proxy refresca la sesión.
        }
      },
    },
  });
}

let adminClient: SupabaseClient | null = null;

/** Cliente con rol de servicio (ignora RLS). Solo servidor; nunca exponer al cliente. */
export function createAdminClient(): SupabaseClient {
  if (!adminClient) {
    const env = publicEnv();
    adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serverEnv().SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}
