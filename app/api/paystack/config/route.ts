import { paystackDoctor } from "@/lib/paystack";
import { NextResponse } from "next/server";

/** Doctor only — never returns secret values. */
export async function GET() {
  const doctor = paystackDoctor();
  return NextResponse.json({
    mode: doctor.mode,
    escrowSupported: true,
    doctor,
  });
}
