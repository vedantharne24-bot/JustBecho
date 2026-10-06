"use client";

import { useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { useAccount } from "@/store/account";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChoiceCard, Field, Textarea } from "@/components/ui/fields";
import { cn } from "@/lib/utils";

const PROMPTS = [
  "Can I see the serial or date code?",
  "Is the box and dust bag original?",
  "When was it last serviced?",
  "Would you consider an offer?",
];

/** Ask the specialist who authenticated a piece — answered on WhatsApp or email. */
export function AskSpecialist({ productName, productSlug, specialist }: { productName: string; productSlug: string; specialist?: string }) {
  const addRequest = useAccount((s) => s.addRequest);
  const pushNotification = useAccount((s) => s.pushNotification);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim().length < 8) {
      setError("Tell us a little more so the specialist can help.");
      return;
    }
    addRequest({ kind: "question", title: `Question about ${productName}`, detail: question.trim(), productSlug });
    pushNotification({
      kind: "order",
      title: "Your question is with a specialist",
      body: `About ${productName}: “${question.trim().slice(0, 80)}${question.trim().length > 80 ? "…" : ""}”`,
      href: "/account/requests",
    });
    setSent(true);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="label group flex items-center gap-2 text-muted transition-colors hover:text-fg">
        <MessageCircle className="h-4 w-4" strokeWidth={1.25} />
        <span className="link-draw">Ask a specialist</span>
      </button>
      <Sheet
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setSent(false);
            setQuestion("");
            setError(null);
          }
        }}
        side="right"
        title="Ask a specialist"
        description={specialist ? `${specialist} authenticated this piece and will answer personally.` : "A specialist for this house will answer personally."}
      >
        {sent ? (
          <div className="flex flex-col items-start py-10" role="status">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-fg">
              <Check className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <p className="font-display mt-8 text-3xl">Question sent.</p>
            <p className="mt-3 text-sm text-muted">
              Expect a reply on {channel === "whatsapp" ? "WhatsApp" : "email"} within two hours (10 am – 8 pm IST). You’ll find
              it under Account → Requests too.
            </p>
            <Button variant="outline" className="mt-8" onClick={() => setOpen(false)}>
              Back to the piece
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-8">
            <div>
              <p className="label mb-3 text-muted">Common questions</p>
              <div className="flex flex-wrap gap-2">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setQuestion(p);
                      setError(null);
                    }}
                    className={cn("rounded-full border px-3.5 py-1.5 text-left text-xs transition-colors", question === p ? "border-fg bg-fg text-bg" : "border-line hover:border-fg")}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Your question" htmlFor="ask-q" error={error ?? undefined}>
              <Textarea id="ask-q" rows={5} value={question} onChange={(e) => { setQuestion(e.target.value); setError(null); }} invalid={!!error} placeholder="Ask about condition, provenance, sizing or anything else." />
            </Field>
            <div>
              <p className="label mb-3 text-muted">Reply by</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ChoiceCard name="channel" value="whatsapp" checked={channel === "whatsapp"} onChange={setChannel} title="WhatsApp" description="Usually within the hour" />
                <ChoiceCard name="channel" value="email" checked={channel === "email"} onChange={setChannel} title="Email" description="With photos attached" />
              </div>
            </div>
            <Button type="submit" full>
              Send to the specialist
            </Button>
          </form>
        )}
      </Sheet>
    </>
  );
}
