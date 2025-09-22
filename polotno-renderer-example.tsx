import React, { useState } from "react";
import PolotnoImageRenderer from "./components/polotno-editor/polotno-image-renderer";

// Sample template data (matching the structure you provided)
const sampleTemplate = {
  dpi: 72,
  unit: "px",
  vars: [
    {
      variable: "test",
      variable_type: "text",
      variable_label: "اختبار",
    },
  ],
  fonts: [],
  pages: [
    {
      id: "front-page",
      bleed: 0,
      width: 323,
      height: 204,
      children: [
        {
          x: 10,
          y: 10,
          id: "R-G_SAzGAX",
          fill: "#000000",
          name: "",
          text: "FRONT",
          type: "text",
          align: "center",
          width: 100,
          height: 21,
          stroke: "black",
          filters: [],
          opacity: 1,
          visible: true,
          rotation: 0,
          draggable: true,
          font_size: 16,
          removable: true,
          resizable: true,
          animations: [],
          brightness: 0,
          font_style: "normal",
          selectable: true,
          blur_radius: 10,
          font_family: "Roboto",
          font_weight: "bold",
          line_height: 1.2,
          placeholder: "",
          shadow_blur: 5,
          blur_enabled: false,
          shadow_color: "black",
          stroke_width: 0,
          always_on_top: false,
          sepia_enabled: false,
          letter_spacing: 0,
          shadow_enabled: false,
          shadow_opacity: 1,
          show_in_export: true,
          style_editable: true,
          text_transform: "none",
          vertical_align: "top",
          shadow_offset_x: 0,
          shadow_offset_y: 0,
          text_decoration: "",
          background_color: "#7ED321",
          content_editable: true,
          grayscale_enabled: false,
          background_enabled: false,
          background_opacity: 1,
          background_padding: 0.5,
          brightness_enabled: false,
          background_corner_radius: 0.5,
        },
        {
          x: 50,
          y: 50,
          id: "zLdg3HWYKG",
          fill: "#000000",
          name: "",
          text: "{test}",
          type: "text",
          align: "center",
          width: 100,
          custom: {
            variable: "test",
            variable_type: "text",
            variable_label: "اختبار",
          },
          height: 25,
          stroke: "black",
          filters: [],
          opacity: 1,
          visible: true,
          rotation: 0,
          draggable: true,
          font_size: 20,
          removable: true,
          resizable: true,
          animations: [],
          brightness: 0,
          font_style: "normal",
          selectable: true,
          blur_radius: 10,
          font_family: "Arial",
          font_weight: "normal",
          line_height: 1.2,
          placeholder: "",
          shadow_blur: 5,
          blur_enabled: false,
          shadow_color: "black",
          stroke_width: 0,
          always_on_top: false,
          sepia_enabled: false,
          letter_spacing: 0,
          shadow_enabled: false,
          shadow_opacity: 1,
          show_in_export: true,
          style_editable: true,
          text_transform: "none",
          vertical_align: "top",
          shadow_offset_x: 0,
          shadow_offset_y: 0,
          text_decoration: "",
          background_color: "#7ED321",
          content_editable: true,
          grayscale_enabled: false,
          background_enabled: false,
          background_opacity: 1,
          background_padding: 0.5,
          brightness_enabled: false,
          background_corner_radius: 0.5,
        },
      ],
      duration: 5000,
      background: "white",
    },
    {
      id: "back-page",
      bleed: 0,
      width: 323,
      height: 204,
      children: [
        {
          x: 10,
          y: 10,
          id: "AGt9TI5iDN",
          fill: "#000000",
          name: "",
          text: "BACK",
          type: "text",
          align: "center",
          width: 100,
          height: 21,
          stroke: "black",
          filters: [],
          opacity: 1,
          visible: true,
          rotation: 0,
          draggable: true,
          font_size: 16,
          removable: true,
          resizable: true,
          animations: [],
          brightness: 0,
          font_style: "normal",
          selectable: true,
          blur_radius: 10,
          font_family: "Roboto",
          font_weight: "bold",
          line_height: 1.2,
          placeholder: "",
          shadow_blur: 5,
          blur_enabled: false,
          shadow_color: "black",
          stroke_width: 0,
          always_on_top: false,
          sepia_enabled: false,
          letter_spacing: 0,
          shadow_enabled: false,
          shadow_opacity: 1,
          show_in_export: true,
          style_editable: true,
          text_transform: "none",
          vertical_align: "top",
          shadow_offset_x: 0,
          shadow_offset_y: 0,
          text_decoration: "",
          background_color: "#7ED321",
          content_editable: true,
          grayscale_enabled: false,
          background_enabled: false,
          background_opacity: 1,
          background_padding: 0.5,
          brightness_enabled: false,
          background_corner_radius: 0.5,
        },
      ],
      duration: 5000,
      background: "white",
    },
  ],
  width: 323,
  audios: [],
  custom: null,
  height: 204,
  schema_version: 2,
};

const PolotnoRendererExample: React.FC = () => {
  const [inputValue, setInputValue] = useState("Hello World!");
  const [previewData, setPreviewData] = useState<Record<string, string>>({
    test: "Hello World!",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setPreviewData({ test: value });
  };

  return (
    <div
      style={{
        padding: "32px",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "30px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "32px",
            color: "#1f2937",
          }}
        >
          Polotno Image Renderer with Data
        </h1>

        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "8px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "#374151",
            }}
          >
            Interactive Preview
          </h2>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              Enter value for "{"{test}"}" variable:
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type something..."
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ textAlign: "center" }}>
            <PolotnoImageRenderer
              template={sampleTemplate}
              data={previewData}
              style={{
                maxWidth: "400px",
                border: "2px solid #d1d5db",
                borderRadius: "8px",
                display: "inline-block",
              }}
              alt="Template preview with data"
            />
          </div>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "8px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "#374151",
            }}
          >
            Without Data (Original Template)
          </h2>

          <div style={{ textAlign: "center" }}>
            <PolotnoImageRenderer
              template={sampleTemplate}
              style={{
                maxWidth: "400px",
                border: "2px solid #d1d5db",
                borderRadius: "8px",
                display: "inline-block",
              }}
              alt="Template preview without data"
            />
          </div>

          <p
            style={{
              marginTop: "16px",
              fontSize: "14px",
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            This shows the template as-is with {"{test}"} not replaced
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "8px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h3 style={{ fontWeight: "600", marginBottom: "12px" }}>
            Usage Example:
          </h3>
          <pre
            style={{
              fontSize: "14px",
              color: "#4b5563",
              overflow: "auto",
              backgroundColor: "#f9fafb",
              padding: "12px",
              borderRadius: "4px",
              border: "1px solid #e5e7eb",
            }}
          >
            {`<PolotnoImageRenderer
  template={templateData}
  data={{ test: "Hello World!" }}
  alt="ID Card Preview"
  style={{ maxWidth: "400px" }}
/>`}
          </pre>

          <h3
            style={{
              fontWeight: "600",
              marginTop: "20px",
              marginBottom: "12px",
            }}
          >
            Features:
          </h3>
          <ul style={{ paddingLeft: "20px", lineHeight: "1.6" }}>
            <li>
              ✅ Accepts optional <code>data</code> prop for variable
              replacement
            </li>
            <li>
              ✅ Replaces <code>{"{variableName}"}</code> patterns in text
              elements
            </li>
            <li>
              ✅ Variables not provided in data remain as{" "}
              <code>{"{variableName}"}</code>
            </li>
            <li>✅ Backward compatible - works without data prop</li>
            <li>✅ Deep processes all pages and children in template</li>
            <li>✅ Real-time updates when data changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PolotnoRendererExample;
