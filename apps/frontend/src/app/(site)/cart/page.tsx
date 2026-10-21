import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Your cart",
};

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
      <SectionHeading as="h1" title="Your cart" />
      <div className="mt-10">
        <CartView />
      </div>
    </div>
  );
}
