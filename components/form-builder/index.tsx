// components/SurveyCreator.tsx
"use client";

import { useState, useEffect } from "react";
import { ICreatorOptions } from "survey-creator-core";
import { SurveyCreator, SurveyCreatorComponent } from "survey-creator-react";
import "survey-core/survey-core.css";
import "survey-creator-core/survey-creator-core.css";
import "survey-creator-core/survey-creator-core.i18n";
import "survey-creator-core/i18n/arabic";
import { editorLocalization } from "survey-creator-core";
import { notifications } from "@mantine/notifications";
import { useCreateForm } from "@/features/form-template/api";
import { useMutationNotifications } from "@/hooks/use-mutation-notifications";

interface SurveyElement {
  type: string;
  name: string;
  title?: string;
  isRequired?: boolean;
  choices?: unknown[];
  inputType?: string;
}

interface SurveyPage {
  name?: string;
  elements?: SurveyElement[];
}

interface SurveyJSON {
  pages?: SurveyPage[];
  title?: string;
  description?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    logFormShape?: () => SurveyJSON;
  }
}

const defaultCreatorOptions: ICreatorOptions = {
  autoSaveEnabled: false,
  collapseOnDrag: true,
  showJSONEditorTab: false,
  showTranslationTab: true,
  previewAllowSelectLanguage: true,
  showSaveButton: true, // Enable the save button
};

editorLocalization.currentLocale = "ar";

export default function SurveyCreatorWidget(props: {
  json?: object;
  options?: ICreatorOptions;
}) {
  const [creator, setCreator] = useState<SurveyCreator>();
  const { notify } = useMutationNotifications();
  const createForm = useCreateForm(notify("create"));

  useEffect(() => {
    if (!creator) {
      const newCreator = new SurveyCreator(
        props.options || defaultCreatorOptions
      );

      // Set up the save function that triggers only when user clicks Save button
      newCreator.saveSurveyFunc = async (saveNo: number) => {
        const surveyJSON = newCreator.JSON as SurveyJSON;
        if (
          !surveyJSON?.pages ||
          !surveyJSON?.title ||
          !surveyJSON?.description
        ) {
          notifications.show({
            title: "Error",
            message: "Survey title, description and form cannot be empty",
            color: "red",
          });
          return;
        }

        const res = await createForm.mutateAsync({
          name: surveyJSON.title,
          slug: surveyJSON.title,
          description: surveyJSON.description,
          form: JSON.stringify(surveyJSON),
          organizationId: 16,
        });

        console.log("=== Save Button Clicked - Survey Form Shape ===");
        console.log("Save Number:", saveNo);
        console.log("Full Survey JSON:", surveyJSON);
        console.log(res);
      };

      setCreator(newCreator);
    }
  }, [creator, props.options]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {creator && <SurveyCreatorComponent creator={creator} />}
    </div>
  );
}
