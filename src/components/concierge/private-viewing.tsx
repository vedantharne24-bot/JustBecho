"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check } from "lucide-react";
import { useAccount } from "@/store/account";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/ui/fields";
import { addBusinessDays, cn } from "@/lib/utils";
import { formatDay } from "@/lib/format";

const LOCATIONS = [
  { value: "mumbai", label: "Mumbai salon", description: "Kala Ghoda · by appointment" },
  { value: "delhi", label: "New Delhi salon", description: "Mehrauli · by appointment" },
  { value: "video", label: "Private video call", description: "With the specialist, piece in hand" },
];
const TIMES = ["11:00", "13:00", "15:00", "17:00", "19:00"];

/** Book time with a piece from the Vault before deciding. */
export function PrivateViewing({ productName, productSlug }: { productName: string; productSlug: string }) {
  const addRequest = useAccount((s) => s.addRequest);
  const pushNotification = useAccount((s) => s.pushNotification);
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState("mumbai");
  const [day, setDay] = useState(0);
  const [time, setTime] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [now] = useState(() => new Date());
  const days = useMemo(() => Array.from({ length: 6 }, (_, i) => addBusinessDays(now, i + 1)), [now]);

  const confirm = () => {
    if (!time) return;
    const loc = LOCATIONS.find((l) => l.value === location)!;
    const date = formatDay(days[day]);
    addRequest({
      kind: "viewing",
      title: `Private viewing · ${productName}`,
      detail: `${loc.label} · ${date} at ${time}`,
      productSlug,
      appointment: { location: loc.label, date, time },
    });
    pushNotification({ kind: "order", title: "Private viewing requested", body: `${productName} — ${loc.label}, ${date} at ${time}. We'll confirm within the hour.`, href: "/account/requests" });
    setBooked(true);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="label group flex items-center gap-2 text-muted transition-colors hover:text-fg">
        <CalendarDays className="h-4 w-4" strokeWidth={1.25} />
        <span className="link-draw">Book a private viewing</span>
      </button>
      <Sheet
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setBooked(false);
            setTime(null);
          }
        }}
        side="right"
        title="Private viewing"
        description={`See ${productName} in person — or on a call with its specialist — before you decide.`}
      >
        {booked ? (
          <div className="flex flex-col items-start py-10" role="status">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-fg">
              <Check className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <p className="font-display mt-8 text-3xl">Request received.</p>
            <p className="mt-3 text-sm text-muted">
              {LOCATIONS.find((l) => l.value === location)?.label}, {formatDay(days[day])} at {time}. A client advisor will confirm
              within the hour; the piece is held for you until then.
            </p>
            <Button variant="outline" className="mt-8" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              {LOCATIONS.map((l) => (
                <ChoiceCard key={l.value} name="location" value={l.value} checked={location === l.value} onChange={setLocation} title={l.label} description={l.description} />
              ))}
            </div>
            <div>
              <p className="label mb-3 text-muted">Day</p>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Day">
                {days.map((d, i) => (
                  <button
                    key={d.toISOString()}
                    type="button"
                    role="radio"
                    aria-checked={day === i}
                    onClick={() => setDay(i)}
                    className={cn("border px-3 py-3 text-left text-sm transition-colors", day === i ? "border-fg bg-fg text-bg" : "border-line hover:border-fg")}
                  >
                    {formatDay(d)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="label mb-3 text-muted">Time</p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Time">
                {TIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={time === t}
                    onClick={() => setTime(t)}
                    className={cn("price rounded-full border px-4 py-2 text-sm transition-colors", time === t ? "border-fg bg-fg text-bg" : "border-line hover:border-fg")}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <Button full disabled={!time} onClick={confirm}>
              Request this appointment
            </Button>
          </div>
        )}
      </Sheet>
    </>
  );
}
