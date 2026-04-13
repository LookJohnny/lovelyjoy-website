import type { Metadata } from "next";
import MianmianKiosk from "@/components/mianmian/MianmianKiosk";

export const metadata: Metadata = {
  title: "棉棉 · 毛绒玩具店智能导购",
  description: "乐芭迪毛绒玩具实体店 AI 导购员棉棉，为你推荐最合适的毛绒玩具。",
};

export default function MianmianPage() {
  return <MianmianKiosk />;
}
