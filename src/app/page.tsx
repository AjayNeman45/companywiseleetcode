import { DashboardClient } from "@/components/dashboard-client";
import { questions } from "@data/questions";

export default function Home() {
  return <DashboardClient questions={questions} />;
}
