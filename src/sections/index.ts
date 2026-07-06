import { Coins, MapPin, Sparkles, type LucideIcon } from "lucide-react";

export interface SectionDef {
  id: string;
  label: string;
  icon: LucideIcon;
  status: "active" | "soon";
  blurb: string;
}

// Add a section here and it appears in the sidebar automatically.
export const sections: SectionDef[] = [
  {
    id: "distance",
    label: "Distance",
    icon: MapPin,
    status: "active",
    blurb: "Commute-willingness scoring",
  },
  {
    id: "skills",
    label: "Skills",
    icon: Sparkles,
    status: "active",
    blurb: "Required-skills overlap",
  },
  {
    id: "payrate",
    label: "Pay rate",
    icon: Coins,
    status: "active",
    blurb: "Budget-fit scoring",
  },
];
