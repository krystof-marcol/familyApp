import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const ALLOWED_PRICE_IDS = new Set([
  "price_1SWMjLCiOh8HBIojn0YjHhxN", // EN small
  "price_1SWMjLCiOh8HBIojuvqHQOt4", // EN medium
  "price_1SWMimCiOh8HBIojsBmORvBa", // EN large
  "price_1SWMimCiOh8HBIojDd4A9vgu", // CZ small
  "price_1SWMgNCiOh8HBIojKX1iHxv4", // CZ medium
  "price_1SWMgNCiOh8HBIoj56afduI0", // CZ large
]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { priceId } = body;

    if (
      !priceId ||
      typeof priceId !== "string" ||
      !ALLOWED_PRICE_IDS.has(priceId)
    ) {
      return NextResponse.json(
        { error: "Invalid or missing priceId" },
        { status: 400 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_types: ["card"],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/donate`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";

    console.error("Stripe checkout error:", err);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
