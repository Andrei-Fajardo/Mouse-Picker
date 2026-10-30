import Picker from "@/components/Picker";
import miceJson from "@/data/mice.json";
import type { Mouse } from "@/lib/types";

export default function Home() {
  return <Picker mice={miceJson as Mouse[]} />;
}
