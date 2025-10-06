"use client";
import { useEffect, useState } from "react";
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from "polotno";
import { Toolbar } from "polotno/toolbar/toolbar";
import { DownloadButton } from "polotno/toolbar/download-button";
import { PagesTimeline } from "polotno/pages-timeline";
import { ZoomButtons } from "polotno/toolbar/zoom-buttons";
import { SidePanel, DEFAULT_SECTIONS } from "polotno/side-panel";
import { Workspace } from "polotno/canvas/workspace";
import { useTranslations } from "next-intl";

import { createStore } from "polotno/model/store";
import { PlaceholderSectionDefinition } from "./placeholder-section";
import { TemplateConfigModal, TemplateConfig } from "./template-config-modal";
import { useCreateTemplate, useUpdateTemplate } from "@/features/templates/api";
import { useMutationNotifications } from "@/hooks/use-mutation-notifications";
import { Template } from "@/features/templates/types";
import {
  saveTemplateToAPI,
  updateTemplateAPI,
  downloadTemplateAsJSON,
  saveTemplateAsSVG,
  lockStoreChanges,
  addTemplateElements,
  initializeStore,
  isValidTemplateJSON,
  isStoreReady,
  flipOrientation,
} from "./helper";
import { QrSection } from "./qr-section";


// Restrict side panel sections - remove size, upload, and other potentially problematic sections
const filteredSections = [
  ...DEFAULT_SECTIONS.filter(
    (section) =>
      section.name === "text" ||
      section.name === "elements" ||
      section.name === "upload" ||
      section.name === "size" ||
      section.name === "background" // Keep background for styling
  ),
];

// Add the custom placeholder section
const sections = [...filteredSections,QrSection, PlaceholderSectionDefinition];

interface EditorProps {
  template?: Template;
}

export const Editor = ({ template }: EditorProps) => {
  // Translation hooks
  const tTemplates = useTranslations("templates");

  // Template configuration state - initialize with template data if provided
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>({
    title: template?.title || "",
    description: template?.description || "",
    price: template?.price ? parseFloat(template.price) : 0,
  });
  const [configModalOpened, setConfigModalOpened] = useState(!template); // Don't show modal if template is provided
  const [hasConfigured, setHasConfigured] = useState(!!template); // Mark as configured if template is provided
  const [isEditMode, setIsEditMode] = useState(!!template); // Track if we're editing an existing template

  // API and notifications
  const { notify } = useMutationNotifications();
  const createTemplate = useCreateTemplate(notify("create"));
  const updateTemplate = useUpdateTemplate(notify("update"));

  // Handle template configuration save
  const handleConfigSave = (config: TemplateConfig) => {
    setTemplateConfig(config);
    setHasConfigured(true);
    // If no template was loaded initially, we're in create mode regardless
    if (!template) {
      setIsEditMode(false);
    }
  };

  // Handle config modal close
  const handleConfigModalClose = () => {
    if (hasConfigured) {
      setConfigModalOpened(false);
    }
    // If not configured yet, modal stays open (required configuration)
  };

  // Handle saving template to API
  const handleSaveTemplate = async () => {
    if (!hasConfigured) return;

    try {
      if (isEditMode && template?.id) {
        // Update existing template
        await updateTemplateAPI(
          store,
          templateConfig,
          template.id,
          updateTemplate
        );
      } else {
        // Create new template
        await saveTemplateToAPI(store, templateConfig, createTemplate);
      }
    } catch (error) {
      // Error handling is done by the mutation notification hook
    }
  };

  // Create store inside component
  const [store] = useState(() => {
    try {
      return initializeStore("bRUVm2sgpCsihGQWBu_u", createStore);
    } catch (error) {
      console.error("Failed to initialize store:", error);
      // Fallback to basic store creation
      return createStore({
        key: "bRUVm2sgpCsihGQWBu_u",
        showCredit: false,
      });
    }
  });

  // Load template into store when template prop changes
  useEffect(() => {
    if (template && template.template && store) {
      // Add delay to ensure store is fully initialized
      const timer = setTimeout(() => {
        try {
          // Validate template structure and store readiness
          if (isValidTemplateJSON(template.template) && isStoreReady(store)) {
            // Load the template JSON into the store
            store.loadJSON(template.template);

            // Update template config state with template data
            setTemplateConfig({
              title: template.title,
              description: template.description,
              price: parseFloat(template.price) || 0,
            });

            // Ensure we're in edit mode
            setIsEditMode(true);
          } else {
            const errorMsg = !isValidTemplateJSON(template.template)
              ? "Invalid template JSON structure"
              : "Store not ready for template loading";
            throw new Error(errorMsg);
          }
        } catch (error) {
          console.error("Failed to load template:", error);
          // Fallback to default initialization if template loading fails
          if (isStoreReady(store)) {
            lockStoreChanges(store);
            addTemplateElements(store);
          }
        }
      }, 200); // Increased delay to ensure store is ready

      return () => clearTimeout(timer);
    }
  }, [template, store]);

  // Custom ActionControls component to include Save as JSON and Save as SVG buttons
  const ActionControls = ({ store }: { store: any }) => {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <DownloadButton store={store} />
        <button
          onClick={() => flipOrientation(store)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#FF6B35",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
          title={tTemplates("actions.tooltips.flipOrientation")}
        >
          {tTemplates("actions.flipOrientation")}
        </button>
        <button
          onClick={() => setConfigModalOpened(true)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#9C36B5",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
          title={
            hasConfigured
              ? tTemplates("actions.tooltips.templateInfo", {
                  title: templateConfig.title,
                  price: templateConfig.price.toString(),
                })
              : tTemplates("actions.tooltips.configureFirst")
          }
        >
          {hasConfigured
            ? isEditMode
              ? tTemplates("actions.editTemplateInfo")
              : tTemplates("actions.editConfiguration")
            : tTemplates("actions.configureTemplate")}
        </button>
        <button
          onClick={handleSaveTemplate}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
          disabled={
            !hasConfigured ||
            createTemplate.isPending ||
            updateTemplate.isPending
          }
          title={
            isEditMode
              ? tTemplates("actions.tooltips.editingTemplate", {
                  title: templateConfig.title,
                })
              : tTemplates("actions.tooltips.createNewTemplate")
          }
        >
          {createTemplate.isPending || updateTemplate.isPending
            ? isEditMode
              ? tTemplates("actions.updating")
              : tTemplates("actions.saving")
            : isEditMode
            ? tTemplates("actions.updateTemplate")
            : tTemplates("actions.saveTemplate")}
        </button>
        <button
          onClick={() => downloadTemplateAsJSON(store, templateConfig)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
          disabled={!hasConfigured}
        >
          {tTemplates("actions.downloadJSON")}
        </button>
        <button
          onClick={() => saveTemplateAsSVG(store, templateConfig)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
          disabled={!hasConfigured}
        >
          {tTemplates("actions.saveAsSVG")}
        </button>
      </div>
    );
  };

  // Apply locks when component mounts - only if no template is provided
  useEffect(() => {
    if (!template && store) {
      // Add a small delay to ensure store and pages are fully initialized
      const timer = setTimeout(() => {
        if (isStoreReady(store)) {
          lockStoreChanges(store);
          addTemplateElements(store);
        }
      }, 300); // Delay after template loading

      return () => clearTimeout(timer);
    } else if (template && store) {
      // If template is provided, still apply locks but don't add template elements
      const timer = setTimeout(() => {
        if (isStoreReady(store)) {
          lockStoreChanges(store);
        }
      }, 400); // Apply locks after template is loaded

      return () => clearTimeout(timer);
    }
  }, [store, template]);

  return (
    <>
      {/* <TemplateConfigModal
        opened={configModalOpened}
        onClose={handleConfigModalClose}
        onSave={handleConfigSave}
        initialConfig={templateConfig}
        isEditMode={isEditMode}
        key={template?.id || "default"} // Force re-render when template changes
      /> */}
      <PolotnoContainer style={{ width: "100vw", height: "100vh" }}>
        <link
          rel="stylesheet"
          href="https://unpkg.com/@blueprintjs/core@5/lib/css/blueprint.css"
        />
        <SidePanelWrap>
          <SidePanel store={store} sections={sections} />
        </SidePanelWrap>
        <WorkspaceWrap>
          <Toolbar
            store={store}
            components={{
              ActionControls,
              // PageBackground, // Disable page background size controls
            }}
          />
          <Workspace
            store={store}
            // components={{
            //   // Hide page controls to prevent adding/removing pages
            //   PageControls: () => null,
            // }}
          />
          <ZoomButtons store={store} />
          <PagesTimeline store={store} />
        </WorkspaceWrap>
      </PolotnoContainer>
    </>
  );
};

export default Editor;
