import type { Metadata } from "next";
import MianmianKiosk from "@/components/mianmian/MianmianKiosk";

export const metadata: Metadata = {
  title: "棉棉 · 毛绒玩具品牌形象大使",
  description: "爱儿采爱儿采毛绒玩具品牌形象大使棉棉，为你介绍最可爱的毛绒玩具。",
};

export default function MianmianPage() {
  return <MianmianKiosk />;
}
