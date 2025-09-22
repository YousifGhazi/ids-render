"use client";

import dynamic from "next/dynamic";

const CreativeEditorSDKNoSSR = dynamic(() => import("./creative-editor-SDK"), {
  ssr: false,
});

export default CreativeEditorSDKNoSSR;
