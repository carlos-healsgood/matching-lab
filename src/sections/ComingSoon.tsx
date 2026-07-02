import { Construction } from "lucide-react";
import { Card } from "../components/ui/primitives";

export function ComingSoon({ label, blurb }: { label: string; blurb: string }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 px-8 py-20 text-center">
      <div className="rounded-2xl bg-amber-500/10 p-4 ring-1 ring-amber-500/20">
        <Construction className="text-amber-300" size={28} />
      </div>
      <h2 className="text-xl font-semibold text-slate-100">{label}</h2>
      <p className="max-w-md text-sm text-slate-400">
        {blurb} — this lab is coming soon. The distance module ships first; skills
        and pay-rate plug into the same interface.
      </p>
    </Card>
  );
}
