<<<<<<< HEAD
=======
"use client";
>>>>>>> upstream/main
import React, { useState, useEffect } from "react";
import { SectionTab } from "polotno/side-panel";
import { IconVariable, IconPlus } from "@tabler/icons-react";

// Define the types for variables
type VariableType = "text" | "number" | "image" | "date";

interface Variable {
  id: string;
  name: string;
  label: string;
  type: VariableType;
}

interface PlaceholderSectionProps {
  store: any;
}

const PlaceholderSection = ({ store }: PlaceholderSectionProps) => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [newVariable, setNewVariable] = useState({
    name: "",
    label: "",
    type: "text" as VariableType,
  });

  // Manual sync function
  const manualSync = () => {
    const page = store.activePage;
    if (!page || !page.children) return;

    const canvasVariables = new Set<string>();

    try {
      page.children.forEach((element: any) => {
        if (element.custom?.variable && element.custom?.variableType) {
          canvasVariables.add(element.custom.variable);
        }
      });

      setVariables((prevVariables) =>
        prevVariables.filter((variable) => canvasVariables.has(variable.name))
      );
    } catch (error) {
      console.warn("Error during manual sync:", error);
    }
  };

  // Trigger sync when panel becomes visible or store changes
  useEffect(() => {
    manualSync();
  }, []);

  // Sync variables with canvas elements
  useEffect(() => {
    const syncVariablesWithCanvas = () => {
      const page = store.activePage;
      if (!page || !page.children) return;

      // Get all elements from the canvas that have variable metadata
      const canvasVariables = new Set<string>();

      // Safely iterate through page children
      try {
        page.children.forEach((element: any) => {
          if (element.custom?.variable && element.custom?.variableType) {
            canvasVariables.add(element.custom.variable);
          }
        });

        // Remove variables from list that are no longer on canvas
        setVariables((prevVariables) =>
          prevVariables.filter((variable) => canvasVariables.has(variable.name))
        );
      } catch (error) {
        console.warn("Error syncing variables with canvas:", error);
      }
    };

    // Initial sync when component mounts or active page changes
    syncVariablesWithCanvas();

    // Set up periodic sync (less frequent, as fallback)
    const intervalId = setInterval(syncVariablesWithCanvas, 2000);

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, [store.activePage]);

  // Add variable to canvas
  const addVariableToCanvas = (variable: Variable) => {
    const page = store.activePage;
    if (!page) return;

    if (
      variable.type === "text" ||
      variable.type === "number" ||
      variable.type === "date"
    ) {
      // Add text variable using {variable_name} syntax
      page.addElement({
        type: "text",
        text: `{${variable.name}}`,
        x: 50,
        y: 50,
        fontSize: 20,
        fontFamily: "Arial",
        fill: "#000000",
        // Store variable metadata in custom property
        custom: {
          variable: variable.name,
          variableType: variable.type,
          variableLabel: variable.label,
        },
      });
    } else if (variable.type === "image") {
      // Create a simple placeholder SVG
      const placeholderSvg = `
        <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
          <rect width="150" height="150" fill="#F3F4F6" stroke="#D1D5DB" stroke-width="2" rx="8"/>
          <g transform="translate(75,60)">
            <circle cx="0" cy="0" r="20" fill="#9CA3AF"/>
            <path d="M-12,-5 L-12,5 L-5,5 L-5,12 L5,12 L5,5 L12,5 L12,-5 L5,-5 L5,-12 L-5,-12 L-5,-5 Z" fill="#FFFFFF"/>
          </g>
          <text x="75" y="130" text-anchor="middle" font-family="Arial" font-size="12" fill="#6B7280">{${variable.name}}</text>
        </svg>
      `;

      const dataUrl = `data:image/svg+xml;base64,${btoa(placeholderSvg)}`;

      // Add image placeholder
      page.addElement({
        type: "image",
        src: dataUrl,
        x: 50,
        y: 50,
        width: 150,
        height: 150,
        // Store variable metadata in custom property
        custom: {
          variable: variable.name,
          variableType: variable.type,
          variableLabel: variable.label,
        },
      });
    }
  };

  // Add a new variable to the list and canvas
  const addVariable = () => {
    if (!newVariable.name || !newVariable.label) return;

    // Check if variable name already exists
    const existingVariable = variables.find(
      (v) => v.name.toLowerCase() === newVariable.name.toLowerCase()
    );
    if (existingVariable) {
      alert(
        `Variable "${newVariable.name}" already exists. Please choose a different name.`
      );
      return;
    }

    const variable: Variable = {
      id: Date.now().toString(),
      name: newVariable.name,
      label: newVariable.label,
      type: newVariable.type,
    };

    // Add to variables list
    setVariables([...variables, variable]);

    // Automatically add to canvas
    addVariableToCanvas(variable);

    // Reset form
    setNewVariable({ name: "", label: "", type: "text" });
  };

  return (
    <div style={{ padding: "20px", height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            Template Variables
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: "14px", color: "#6B7280" }}>
          Create placeholders for dynamic content
        </p>
      </div>

      {/* Add new variable form */}
      <div
        style={{
          marginBottom: "24px",
          padding: "16px",
          backgroundColor: "#F9FAFB",
          borderRadius: "8px",
          border: "1px solid #E5E7EB",
        }}
      >
        <h4
          style={{
            margin: "0 0 12px 0",
            fontSize: "14px",
            fontWeight: "500",
            color: "#374151",
          }}
        >
          Add New Variable
        </h4>

        {/* Variable Type */}
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Type
          </label>
          <select
            value={newVariable.type}
            onChange={(e) =>
              setNewVariable({
                ...newVariable,
                type: e.target.value as VariableType,
              })
            }
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #D1D5DB",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: "#FFFFFF",
            }}
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="image">Image</option>
            <option value="date">Date</option>
          </select>
        </div>

        {/* Variable Name */}
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Variable Name
          </label>
          <input
            type="text"
            placeholder="e.g., firstName"
            value={newVariable.name}
            onChange={(e) =>
              setNewVariable({ ...newVariable, name: e.target.value })
            }
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #D1D5DB",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Variable Label */}
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Display Label
          </label>
          <input
            type="text"
            placeholder="e.g., First Name"
            value={newVariable.label}
            onChange={(e) =>
              setNewVariable({ ...newVariable, label: e.target.value })
            }
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #D1D5DB",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Add Button */}
        <button
          onClick={addVariable}
          disabled={!newVariable.name || !newVariable.label}
          style={{
            width: "100%",
            padding: "8px 16px",
            backgroundColor:
              newVariable.name && newVariable.label ? "#3B82F6" : "#9CA3AF",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            cursor:
              newVariable.name && newVariable.label ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <IconPlus size={16} />
          Create & Add to Canvas
        </button>
      </div>
    </div>
  );
};

// Create the section definition for Polotno
export const PlaceholderSectionDefinition = {
  name: "placeholders",
  Tab: (props: any) => (
    <SectionTab name="Variables" {...props}>
      <IconVariable />
    </SectionTab>
  ),
  Panel: PlaceholderSection,
};

export default PlaceholderSection;
