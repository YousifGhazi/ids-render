import React from "react";
import { observer } from "mobx-react-lite";
import { SectionTab } from "polotno/side-panel";
import QRCode from "qrcode";
import * as svg from "polotno/utils/svg";
import { IconQrcode } from "@tabler/icons-react";
import { Button, InputGroup } from "@blueprintjs/core";

// create svg image for QR code for input text
export async function getQR(text, color = "#000000") {
  return new Promise((resolve) => {
    QRCode.toString(
      text || "no-data",
      {
        type: "svg",
        color: {
          dark: color, // QR code dots color
          light: "#0000", // Transparent background
        },
      },
      (err, string) => {
        resolve(svg.svgToURL(string));
      }
    );
  });
}

// define the new custom section
export const QrSection = {
  name: "qr",
  Tab: (props) => (
    <SectionTab name="Qr" {...props}>
      <IconQrcode />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: observer(({ store }) => {
    const [val, setVal] = React.useState("");
    const [color, setColor] = React.useState("#ffffff"); // Default white color

    const el = store.selectedElements[0];
    const isQR = el?.name === "qr";

    // if selection is changed we need to update input value
    React.useEffect(() => {
      if (el?.custom?.value) {
        setVal(el?.custom.value);
      }
      if (el?.custom?.color) {
        setColor(el?.custom.color);
      }
    }, [isQR, el]);

    // update image src when we change input data
    React.useEffect(() => {
      if (isQR) {
        getQR(val, color).then((src) => {
          el.set({
            src,
            custom: {
              value: val,
              color: color,
            },
          });
        });
      }
    }, [el, val, color, isQR]);

    return (
      <div>
        {isQR && <p>Update select QR code:</p>}
        {!isQR && <p>Create new QR code:</p>}
        <InputGroup
          onChange={(e) => {
            setVal(e.target.value);
          }}
          placeholder="Type qr code content"
          value={val}
          style={{ width: "100%" }}
        />
        <div style={{ marginTop: "10px" }}>
          <label
            style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}
          >
            QR Code Color:
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
            }}
            style={{
              width: "100%",
              height: "40px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "20px",
          }}
        >
          <Button
            style={{
              display: isQR ? "" : "none",
            }}
            onClick={() => {
              store.selectElements([]);
              setVal("");
              setColor("#ffffff");
            }}
          >
            Cancel
          </Button>
          <Button
            style={{
              display: isQR ? "none" : "",
            }}
            onClick={async () => {
              const src = await getQR(val, color);

              store.activePage.addElement({
                type: "svg",
                name: "qr",
                x: 50,
                y: 50,
                width: 50,
                height: 50,
                src,
                custom: {
                  value: val,
                  color: color,
                },
              });
            }}
          >
            Add new QR code
          </Button>
        </div>
      </div>
    );
  }),
};
