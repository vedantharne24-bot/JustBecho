import { editorial } from "@/lib/images";
import type { ProductImage } from "@/lib/types";

export interface ProtectStage {
  key: string;
  title: string;
  short: string;
  description: string;
  details: string[];
  duration: string;
  image: ProductImage;
}

export const PROTECT_STAGES: ProtectStage[] = [
  {
    key: "ships",
    title: "The seller ships to us",
    short: "Seller ships",
    description:
      "Nothing goes straight from a seller to you. Within 48 hours of your order the seller packs the piece on camera and sends it to the Becho Hub in Mumbai.",
    details: ["Packing recorded on video", "Insured, tracked pickup", "Seller identity KYC-verified"],
    duration: "Day 1–2",
    image: editorial.shipBox,
  },
  {
    key: "received",
    title: "Received and logged",
    short: "Received",
    description:
      "Every parcel is opened under CCTV, weighed and photographed from twelve angles. The piece is matched against its listing before anyone touches it.",
    details: ["Opened under CCTV", "12-angle intake photography", "Listing and weight reconciled"],
    duration: "Day 2–3",
    image: editorial.hubVan,
  },
  {
    key: "authentication",
    title: "Authenticated by a specialist",
    short: "Authentication",
    description:
      "A specialist for that house examines stitching, stamps, serials, hardware and materials against our reference library of verified pieces.",
    details: ["Brand-specific specialist", "Serials and date codes cross-checked", "UV, loupe and material tests"],
    duration: "Day 3",
    image: editorial.loupe,
  },
  {
    key: "inspection",
    title: "Inspected for condition",
    short: "Inspection",
    description:
      "Condition is graded on our six-point scale. Anything the listing didn't mention — a scuff, a service due — you hear about before we ship.",
    details: ["Six-point condition grade", "Movement timed for watches", "You approve any discrepancy"],
    duration: "Day 3–4",
    image: editorial.glovedPatek,
  },
  {
    key: "approval",
    title: "Approved and sealed",
    short: "Approval",
    description:
      "Passed pieces are sealed with a numbered, tamper-evident Becho tag and issued a digital certificate that lives in your account forever.",
    details: ["Numbered tamper-evident seal", "Digital certificate of authenticity", "Re-boxed in archival packaging"],
    duration: "Day 4",
    image: editorial.sealedBox,
  },
  {
    key: "delivered",
    title: "Delivered to you",
    short: "Delivered",
    description:
      "Insured, OTP-verified delivery to your door. If anything isn't as promised, our money-back guarantee covers you in full.",
    details: ["Fully insured in transit", "OTP-verified handover", "Money-back guarantee"],
    duration: "Day 5–7",
    image: editorial.handover,
  },
];
