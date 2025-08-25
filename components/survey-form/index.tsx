// src/components/SurveyForm.tsx
"use client"; // keep if you’re in Next.js App Router

import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.css";

type Props = {
  schema: object;
  onSubmit?: (data: object) => void;
};

export default function SurveyForm({ schema, onSubmit }: Props) {
  const survey = new Model(schema);

  // optional events
  survey.onComplete.add((sender) => {
    const results = sender.data; // all answers as a plain object
    onSubmit?.(results);
  });

  return <Survey model={survey} />;
}
