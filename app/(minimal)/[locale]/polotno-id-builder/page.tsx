"use client";

import dynamic from "next/dynamic";
const Editor = dynamic(() => import("@/components/polotno-editor/editor"), {
  ssr: false,
});

export default function Home() {
  return <Editor />;
}
