import { createAdminClient } from "@/lib/db/clients";
import { createMercadoPagoGateway } from "./mercadopago";
import { createEmailNotifier } from "./notify";
import { createSupabasePaymentStore } from "./store-supabase";
import type { ProcessDeps } from "./process-payment";

/** Dependencias de producción para procesar pagos. */
export function productionPaymentDeps(): ProcessDeps {
  const db = createAdminClient();
  return {
    store: createSupabasePaymentStore(db),
    gateway: createMercadoPagoGateway(),
    notifier: createEmailNotifier(db),
  };
}
