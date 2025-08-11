// components/SurveyCreator.tsx
'use client'

import { useState } from "react";
import { ICreatorOptions } from "survey-creator-core";
import { SurveyCreator, SurveyCreatorComponent } from "survey-creator-react";
import "survey-core/survey-core.css";
import "survey-creator-core/survey-creator-core.css";
import "survey-creator-core/survey-creator-core.i18n";
import "survey-creator-core/i18n/arabic"; 
import { editorLocalization } from "survey-creator-core";

const defaultCreatorOptions: ICreatorOptions = {
  autoSaveEnabled: false,
  collapseOnDrag: true,
  showJSONEditorTab: false,
  showTranslationTab: true,
  previewAllowSelectLanguage: true
};

editorLocalization.currentLocale = "ar";

export default function SurveyCreatorWidget(props: { json?: object, options?: ICreatorOptions }) {
  const [creator, setCreator] = useState<SurveyCreator>();

  if (!creator) {
    setCreator(new SurveyCreator(props.options || defaultCreatorOptions));
  }

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {
        creator && <SurveyCreatorComponent creator={creator} />
      }
    </div>
  );
}
