"use client";
import dynamic from "next/dynamic";

const SurveyCreator = dynamic(() => import("@/components/form-builder/index"), {
  ssr: false,
});

export default function Home() {
  return <SurveyCreator />;
}
