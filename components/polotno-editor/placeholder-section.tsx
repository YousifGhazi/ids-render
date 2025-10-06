"use client";
import React, { useState, useEffect } from "react";
import { SectionTab } from "polotno/side-panel";
import { IconVariable, IconPlus } from "@tabler/icons-react";

// Define the types for variables
type VariableType = "text" | "number" | "image" | "date" | "file";

interface Variable {
  id: string;
  name: string;
  label: string;
  type: VariableType;
  isVisible: boolean; // Controls if variable renders on canvas
}

interface PlaceholderSectionProps {
  store: any;
}

const PlaceholderSection = ({ store }: PlaceholderSectionProps) => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [invisibleVariables, setInvisibleVariables] = useState<Variable[]>([]); // Track invisible variables separately
  const [newVariable, setNewVariable] = useState({
    name: "",
    label: "",
    type: "text" as VariableType,
    isVisible: true, // Default to visible
  });
  const [isInitialized, setIsInitialized] = useState(false); // Track if template has been loaded

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

      // Filter visible variables based on canvas presence
      setVariables((prevVariables) =>
        prevVariables.filter((variable) => canvasVariables.has(variable.name))
      );
      
      // Invisible variables are not on canvas, so we don't filter them based on canvas presence
      // They should only be removed manually by the user
    } catch (error) {
      console.warn("Error during manual sync:", error);
    }
  };

  // Load invisible variables from template when component mounts or template changes
  useEffect(() => {
    const loadInvisibleVariablesFromTemplate = () => {
      try {
        const json = store.toJSON();
        const invisible: Variable[] = [];
        
        // First, try to load from store's custom property (preferred method)
        if (json.custom?.invisibleVariables && Array.isArray(json.custom.invisibleVariables)) {
          json.custom.invisibleVariables.forEach((varData: any) => {
            invisible.push({
              id: Date.now().toString() + Math.random(), // Generate unique ID
              name: varData.variable,
              label: varData.variableLabel || varData.variable,
              type: varData.variableType as VariableType,
              isVisible: false,
            });
          });
        }
        // Fallback: Check if template has vars array (for backward compatibility)
        else if (json.vars && Array.isArray(json.vars)) {
          json.vars.forEach((varData: any) => {
            // Only load variables that are marked as invisible
            if (varData.isVisible === false) {
              invisible.push({
                id: Date.now().toString() + Math.random(), // Generate unique ID
                name: varData.variable,
                label: varData.variableLabel || varData.variable,
                type: varData.variableType as VariableType,
                isVisible: false,
              });
            }
          });
        }
        
        if (invisible.length > 0) {
          setInvisibleVariables(invisible);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.warn("Error loading invisible variables from template:", error);
        setIsInitialized(true);
      }
    };
    
    // Delay to ensure store is ready
    const timer = setTimeout(loadInvisibleVariablesFromTemplate, 500);
    return () => clearTimeout(timer);
  }, [store]);

  // Trigger sync when panel becomes visible or store changes
  useEffect(() => {
    if (isInitialized) {
      manualSync();
    }
  }, [isInitialized]);

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

        // Remove visible variables from list that are no longer on canvas
        setVariables((prevVariables) =>
          prevVariables.filter((variable) => canvasVariables.has(variable.name))
        );
        
        // Invisible variables remain in the list regardless of canvas presence
        // They are managed separately and only removed by user action
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
          isVisible: variable.isVisible, // Include isVisible property
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
          isVisible: variable.isVisible, // Include isVisible property
        },
      });
    }
  };

  // Delete an invisible variable
  const deleteInvisibleVariable = (variableId: string) => {
    setInvisibleVariables((prev) => prev.filter((v) => v.id !== variableId));
  };

  // Sync invisible variables to store's custom property
  // This ensures invisible variables are included when the template is saved
  useEffect(() => {
    if (!isInitialized) return;
    
    const syncInvisibleVariablesToStore = () => {
      try {
        // Convert invisible variables to the format expected in vars array
        const invisibleVarsData = invisibleVariables.map((v) => ({
          variable: v.name,
          variableLabel: v.label,
          variableType: v.type,
          isVisible: false,
        }));
        
        // Store invisible variables in the store's custom property
        // This ensures they persist with the store and are included in toJSON()
        if (store && typeof store.set === 'function') {
          const currentCustom = store.custom || {};
          store.set({
            custom: {
              ...currentCustom,
              invisibleVariables: invisibleVarsData,
            }
          });
        }
        
      } catch (error) {
        console.warn("Error syncing invisible variables to store:", error);
      }
    };
    
    // Sync whenever invisible variables change
    syncInvisibleVariablesToStore();
  }, [invisibleVariables, isInitialized, store]);

  // Add a new variable to the list and canvas
  const addVariable = () => {
    if (!newVariable.name || !newVariable.label) return;

    // Check if variable name already exists in both visible and invisible lists
    const existingVisibleVariable = variables.find(
      (v) => v.name.toLowerCase() === newVariable.name.toLowerCase()
    );
    const existingInvisibleVariable = invisibleVariables.find(
      (v) => v.name.toLowerCase() === newVariable.name.toLowerCase()
    );
    if (existingVisibleVariable || existingInvisibleVariable) {
      alert(
        `Variable "${newVariable.name}" already exists. Please choose a different name.`
      );
      return;
    }

    // File type variables are always invisible
    const isVisible = newVariable.type === "file" ? false : newVariable.isVisible;

    const variable: Variable = {
      id: Date.now().toString(),
      name: newVariable.name,
      label: newVariable.label,
      type: newVariable.type,
      isVisible: isVisible,
    };

    if (isVisible) {
      // Add to visible variables list
      setVariables([...variables, variable]);
      // Automatically add to canvas
      addVariableToCanvas(variable);
    } else {
      // Add to invisible variables list (not rendered on canvas)
      setInvisibleVariables([...invisibleVariables, variable]);
    }

    // Reset form
    setNewVariable({ name: "", label: "", type: "text", isVisible: true });
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
            onChange={(e) => {
              const selectedType = e.target.value as VariableType;
              setNewVariable({
                ...newVariable,
                type: selectedType,
                // File type is always invisible
                isVisible: selectedType === "file" ? false : newVariable.isVisible,
              });
            }}
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
            <option value="file">File</option>
          </select>
        </div>

        {/* Visibility Selection - Only for non-file types */}
        {newVariable.type !== "file" && (
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
              Visibility
            </label>
            <select
              value={newVariable.isVisible ? "visible" : "invisible"}
              onChange={(e) =>
                setNewVariable({
                  ...newVariable,
                  isVisible: e.target.value === "visible",
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
              <option value="visible">Visible</option>
              <option value="invisible">Invisible</option>
            </select>
          </div>
        )}

        {/* Info message for file type */}
        {newVariable.type === "file" && (
          <div
            style={{
              marginBottom: "12px",
              padding: "8px 12px",
              backgroundColor: "#FEF3C7",
              border: "1px solid #FCD34D",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#92400E",
            }}
          >
            Note: File variables are always invisible and won't render on canvas.
          </div>
        )}

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

      {/* Invisible Variables List */}
      {invisibleVariables.length > 0 && (
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            backgroundColor: "#F3F4F6",
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
            Invisible Variables
          </h4>
          <p
            style={{
              margin: "0 0 12px 0",
              fontSize: "12px",
              color: "#6B7280",
            }}
          >
            These variables exist in the template but don't render on the canvas.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {invisibleVariables.map((variable) => (
              <div
                key={variable.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    {variable.label}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6B7280",
                      marginTop: "2px",
                    }}
                  >
                    {variable.name} • {variable.type}
                  </div>
                </div>
                <button
                  onClick={() => deleteInvisibleVariable(variable.id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#EF4444",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                  title="Delete variable"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
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
