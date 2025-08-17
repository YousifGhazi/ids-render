import React from 'react';
import IDCardView from './id-card-view';
import type { TemplateData } from './id-card-view';

// Example template data with both front and back sides
const exampleTemplateData: TemplateData = {
  canvasWidth: 400,
  canvasHeight: 250,
  frontCanvas: {
    objects: [
      {
        type: 'Rect',
        left: 0,
        top: 0,
        width: 400,
        height: 250,
        fill: '#f0f9ff',
        stroke: '#0369a1',
        strokeWidth: 2,
      },
      {
        type: 'IText',
        left: 20,
        top: 20,
        width: 360,
        height: 40,
        text: 'COMPANY NAME',
        fontSize: 24,
        fontWeight: 'bold',
        fill: '#0369a1',
        textAlign: 'center',
      },
      {
        type: 'Image',
        left: 20,
        top: 80,
        width: 80,
        height: 80,
        src: '/assets/profile.png',
      },
      {
        type: 'IText',
        left: 120,
        top: 90,
        width: 260,
        height: 30,
        text: 'John Doe',
        fontSize: 20,
        fontWeight: 'bold',
        fill: '#1f2937',
      },
      {
        type: 'IText',
        left: 120,
        top: 120,
        width: 260,
        height: 20,
        text: 'Software Engineer',
        fontSize: 14,
        fill: '#6b7280',
      },
      {
        type: 'IText',
        left: 120,
        top: 140,
        width: 260,
        height: 20,
        text: 'ID: EMP001',
        fontSize: 12,
        fill: '#9ca3af',
      },
    ],
  },
  backCanvas: {
    objects: [
      {
        type: 'Rect',
        left: 0,
        top: 0,
        width: 400,
        height: 250,
        fill: '#fef3c7',
        stroke: '#d97706',
        strokeWidth: 2,
      },
      {
        type: 'IText',
        left: 20,
        top: 20,
        width: 360,
        height: 30,
        text: 'Emergency Contact',
        fontSize: 18,
        fontWeight: 'bold',
        fill: '#d97706',
        textAlign: 'center',
      },
      {
        type: 'IText',
        left: 20,
        top: 70,
        width: 360,
        height: 20,
        text: 'Name: Jane Doe',
        fontSize: 14,
        fill: '#1f2937',
      },
      {
        type: 'IText',
        left: 20,
        top: 100,
        width: 360,
        height: 20,
        text: 'Phone: +1 (555) 123-4567',
        fontSize: 14,
        fill: '#1f2937',
      },
      {
        type: 'IText',
        left: 20,
        top: 130,
        width: 360,
        height: 20,
        text: 'Relationship: Spouse',
        fontSize: 14,
        fill: '#1f2937',
      },
      {
        type: 'IText',
        left: 20,
        top: 180,
        width: 360,
        height: 40,
        text: 'This card is property of Company Name.\nIf found, please return to HR Department.',
        fontSize: 10,
        fill: '#6b7280',
        textAlign: 'center',
      },
    ],
  },
};

const IDCardViewExample: React.FC = () => {
  const handleSideChange = (side: 'front' | 'back') => {
    console.log(`Card side changed to: ${side}`);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Single Side View (with toggle)</h2>
        <IDCardView
          templateData={exampleTemplateData}
          onSideChange={handleSideChange}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Both Sides View</h2>
        <IDCardView
          templateData={exampleTemplateData}
          showBothSides={true}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Default to Back Side</h2>
        <IDCardView
          templateData={exampleTemplateData}
          defaultSide="back"
          onSideChange={handleSideChange}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Front Only (no back canvas)</h2>
        <IDCardView
          templateData={{
            ...exampleTemplateData,
            backCanvas: undefined,
          }}
        />
      </div>
    </div>
  );
};

export default IDCardViewExample;