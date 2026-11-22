"use client";

import { Button, TextLink } from "@/components/ui/Button";
import { useMarket } from "@/components/market/MarketProvider";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useMemo, useState } from "react";

type StripeDepositFormProps = {
  clientSecret: string;
  publishableKey: string;
  depositAmount: number;
  onSuccess: () => void;
  onError: (message: string) => void;
  onUseMock: () => void;
};

function DepositPayButton({
  depositAmount,
  onSuccess,
  onError,
}: {
  depositAmount: number;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { formatMoney } = useMarket();
  const [paying, setPaying] = useState(false);

  async function onPay() {
    if (!stripe || !elements || paying) return;
    setPaying(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url:
          typeof window !== "undefined"
            ? `${window.location.origin}/booking/checkout-return`
            : undefined,
      },
    });
    setPaying(false);

    if (error) {
      onError(error.message || "Payment failed");
      return;
    }
    if (
      paymentIntent &&
      (paymentIntent.status === "succeeded" ||
        paymentIntent.status === "processing")
    ) {
      onSuccess();
      return;
    }
    onError("Payment incomplete");
  }

  return (
    <Button type="button" disabled={!stripe || paying} onClick={onPay}>
      {paying ? "…" : `Pay ${formatMoney(depositAmount)}`}
    </Button>
  );
}

export function StripeDepositForm({
  clientSecret,
  publishableKey,
  depositAmount,
  onSuccess,
  onError,
  onUseMock,
}: StripeDepositFormProps) {
  const stripePromise = useMemo(
    () => loadStripe(publishableKey) as Promise<Stripe | null>,
    [publishableKey]
  );

  return (
    <div className="animate-fade-in mt-8">
      <p className="mb-4 text-sm text-brand-muted">Pay with Stripe</p>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#5B2C87",
              borderRadius: "12px",
              fontFamily: "system-ui, sans-serif",
            },
          },
        }}
      >
        <PaymentElement
          options={{
            layout: "tabs",
            wallets: {
              applePay: "auto",
              googlePay: "auto",
            },
          }}
        />
        <div className="mt-6">
          <DepositPayButton
            depositAmount={depositAmount}
            onSuccess={onSuccess}
            onError={onError}
          />
        </div>
      </Elements>
      <TextLink className="mt-4 block w-full text-center" onClick={onUseMock}>
        Use mock pay
      </TextLink>
    </div>
  );
}
