"use client";
import { useGetForm } from "@/features/form-template/api";
import { Paper } from "@mantine/core";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
const Survey = dynamic(() => import("@/components/survey-form"), {
  ssr: false,
});

export default function SurveyPage() {
  const params = useParams();
  const query = useGetForm((params?.id as string) || "2");
  return (
    <Paper h={"100vh"}>
      <Survey
        schema={JSON.parse(query.data?.form || "{}")}
        onSubmit={(data) => console.log(data)}
      />
    </Paper>
  );
}
