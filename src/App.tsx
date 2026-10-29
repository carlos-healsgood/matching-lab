import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { sections } from "./sections";
import { DistanceSection } from "./sections/DistanceSection";
import { PayRateSection } from "./sections/PayRateSection";
import { SkillsSection } from "./sections/SkillsSection";
import { ComingSoon } from "./sections/ComingSoon";
import { WhoShowsUpSection } from "./sections/WhoShowsUpSection";

export default function App() {
  const [active, setActive] = useState(() => {
    const fromHash = window.location.hash.slice(1);
    return sections.some((s) => s.id === fromHash) ? fromHash : "who";
  });
  const select = (id: string) => {
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
  };
  const section = sections.find((s) => s.id === active) ?? sections[0];

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar active={active} onSelect={select} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-50">
              AI Matching Playground
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              See, tweak and experiment with the algorithms behind
              candidate&nbsp;↔&nbsp;vacancy matching.
            </p>
          </header>

          {active === "who" ? (
            <WhoShowsUpSection />
          ) : active === "distance" ? (
            <DistanceSection />
          ) : active === "payrate" ? (
            <PayRateSection />
          ) : active === "skills" ? (
            <SkillsSection />
          ) : (
            <ComingSoon label={section.label} blurb={section.blurb} />
          )}
        </div>
      </main>
    </div>
  );
}
