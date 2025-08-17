import React from "react";
import IDCardView from "./components/ids-designer/id-card-view";
import templateDataJson from "./id-card-template.json";

// Type the template data properly
const templateData = templateDataJson as unknown as Parameters<typeof IDCardView>[0]['templateData'];

// Sample data for the ID card
const sampleData = {
  name: "أحمد محمد علي",
  speciality: "مهندس برمجيات",
  rank: "كبير المطورين",
  department: "قسم التكنولوجيا",
  province: "الرياض",
  membershipNumber: "12345",
  membershipDate: "2023-01-15",
  issueDate: "2024-01-01",
  validUntil: "2025-12-31",
  photo: "/assets/profile.png",
};

const ExampleUsage: React.FC = () => {
  return (
    <div style={{ padding: "32px", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: "896px", margin: "0 auto" }}>
        <h1 style={{ 
          fontSize: "30px", 
          fontWeight: "bold", 
          textAlign: "center", 
          marginBottom: "32px", 
          color: "#1f2937" 
        }}>
          ID Card View - Front & Back
        </h1>
        
        <div style={{ 
          backgroundColor: "white", 
          padding: "24px", 
          borderRadius: "8px", 
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" 
        }}>
          <h2 style={{ 
            fontSize: "20px", 
            fontWeight: "600", 
            marginBottom: "16px", 
            color: "#374151" 
          }}>
            Complete ID Card (Front on Top, Back on Bottom)
          </h2>
          
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ 
              border: "2px solid #d1d5db", 
              borderRadius: "8px",
              display: "inline-block"
            }}>
              <IDCardView
                templateData={templateData}
                data={sampleData}
                width={600}
                height={800} // Increased height to accommodate both sides
              />
            </div>
          </div>
          
          <div style={{ 
            marginTop: "24px", 
            padding: "16px", 
            backgroundColor: "#f3f4f6", 
            borderRadius: "4px" 
          }}>
            <h3 style={{ fontWeight: "600", marginBottom: "8px" }}>Sample Data:</h3>
            <pre style={{ 
              fontSize: "14px", 
              color: "#4b5563", 
              overflow: "auto" 
            }}>
              {JSON.stringify(sampleData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleUsage;