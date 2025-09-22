"use client";

import { useEffect, useRef, useState } from "react";
import CreativeEditorSDK from "@cesdk/cesdk-js";

// configure CreativeEditor SDK

export default function CreativeEditorSDKComponent() {
  // reference to the container HTML element where CESDK will be initialized
  const cesdk_container = useRef(null);
  // define a state variable to keep track of the CESDK instance
  const [cesdk, setCesdk] = useState(null);

  useEffect(() => {
    // prevent initialization if the container element is not available yet
    if (!cesdk_container.current) {
      return;
    }

    // flag to keep track of the component unmount
    let cleanedUp = false;
    // where to store the local CE.SDK instance
    let instance;

    const config = {
      license:
        "f4GlAdwxPKy-_3R4IIQAM9bQLaiSfVI4LjHUhfNUqmhtPQRYMkjgu1oFVt1f7asJ", // replace with a valid CE.SDK license key
      callbacks: { onUpload: "local" }, // enable local file uploads in the Asset Library
      // ui: {
      //   elements: {
      //     blocks: {
      //       ["//ly.img.ubq/page"]: { manage: false },
      //     },
      //   },
      //   pagePresetLibraries: ["my-fixed-format"],
      // },
    };

    // initialize the CreativeEditorSDK instance in the container HTML element
    // using the given config
    CreativeEditorSDK.create(cesdk_container.current, config).then(
      async (_instance) => {
        // assign the current CD.SDK instance to the local variable
        instance = _instance;

        if (cleanedUp) {
          instance.dispose();
          return;
        }

        // create a new design scene in the editor
        await instance.createDesignScene();

        // With this:
        instance.ui.registerPanel(
          "variablePanel",
          ({ builder, engine, state }) => {
            const { value, setValue } = state("newVarName", "");
            builder.Text("label", { text: "Variable Name:" });
            builder.TextInput("input", {
              placeholder: "e.g. username",
              value,
              setValue,
            });
            builder.Button("add-var", {
              label: "Add Variable",
              onClick: () => {
                const name = value.trim();
                if (name) {
                  engine.variable.setString(name, "");
                  setValue("");
                }
              },
            });
          }
        );

        // Add toggle button to dock
        instance.ui.registerComponent("variablePanel.dock", ({ builder }) => {
          const isOpen = instance.ui.isPanelOpen("variablePanel");
          builder.Button("tog-btn", {
            label: isOpen ? "Close Variable Panel" : "Add Variable",
            onClick: () => {
              if (isOpen) {
                instance.ui.closePanel("variablePanel");
              } else {
                instance.ui.openPanel("variablePanel");
              }
            },
          });
        });

        // Update dock order
        instance.ui.setDockOrder([
          ...instance.ui.getDockOrder(),
          "variablePanel.dock",
        ]);

        setCesdk(instance);
      }
    );

    // cleanup function to dispose of the CESDK instance when the component unmounts
    const cleanup = () => {
      // clear the local state and dispose of the CS.SDK instance (if it has been assigned)
      cleanedUp = true;
      instance?.dispose();
      setCesdk(null);
    };

    // to ensure cleanup runs when the component unmounts
    return cleanup;
  }, [cesdk_container]);

  return (
    // the container HTML element where the CESDK editor will be mounted
    <div
      ref={cesdk_container}
      style={{ width: "100vw", height: "100vh" }}
    ></div>
  );
}
