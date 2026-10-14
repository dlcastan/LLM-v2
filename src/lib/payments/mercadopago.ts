import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { publicEnv, serverEnv } from "@/lib/env";
import type { MpPayment, MpStatus, PaymentGateway } from "./types";

const KNOWN: MpStatus[] = [
  "approved",
  "pending",
  "in_process",
  "rejected",
  "refunded",
  "charged_back",
  "cancelled",
];

function normalizeStatus(status: string | undefined): MpStatus {
  return (KNOWN as string[]).includes(status ?? "") ? (status as MpStatus) : "pending";
}

export function createMercadoPagoGateway(): PaymentGateway {
  const client = new MercadoPagoConfig({ accessToken: serverEnv().MP_ACCESS_TOKEN });

  const toPayment = (p: {
    id?: number | string;
    status?: string;
    date_last_updated?: string;
    date_created?: string;
    external_reference?: string;
    transaction_amount?: number;
  }): MpPayment => ({
    id: String(p.id),
    status: normalizeStatus(p.status),
    dateLastUpdated: String(p.date_last_updated ?? p.date_created ?? ""),
    externalReference: String(p.external_reference ?? ""),
    amount: Number(p.transaction_amount ?? 0),
  });

  return {
    async getPayment(paymentId): Promise<MpPayment> {
      return toPayment(await new Payment(client).get({ id: paymentId }));
    },

    async findPaymentsByReference(externalReference): Promise<MpPayment[]> {
      const res = await new Payment(client).search({
        options: { external_reference: externalReference, sort: "date_last_updated", criteria: "desc" },
      });
      return (res.results ?? []).map(toPayment);
    },

    async createPreference({ purchaseId, title, amount, payerEmail }) {
      const appUrl = publicEnv().NEXT_PUBLIC_APP_URL;
      const pref = await new Preference(client).create({
        body: {
          items: [{ id: purchaseId, title, quantity: 1, unit_price: amount, currency_id: "ARS" }],
          payer: { email: payerEmail },
          external_reference: purchaseId,
          notification_url: `${appUrl}/api/webhooks/mercadopago`,
          back_urls: {
            success: `${appUrl}/mi-cuenta`,
            pending: `${appUrl}/mi-cuenta/compras`,
            failure: `${appUrl}/mi-cuenta/compras`,
          },
          auto_return: "approved",
        },
      });
      return { preferenceId: String(pref.id), checkoutUrl: String(pref.init_point) };
    },
  };
}
