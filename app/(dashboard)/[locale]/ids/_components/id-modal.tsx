"use client";

import IDCardView from "@/components/ids-designer/id-card-view";
import { IDCard } from "@/features/ids/types";
import { useGetTemplate } from "@/features/templates/api";
import { TemplateData } from "@/features/templates/interfaces";
import { Modal, Skeleton, Stack } from "@mantine/core";

interface IdCardModalProps {
  idCard?: IDCard;
  opened: boolean;
  onClose: () => void;
}

export function IdCardModal({ idCard, opened, onClose }: IdCardModalProps) {
  const {
    isLoading: isLoadingTemplate,
    data,
  } = useGetTemplate(idCard?.template.id as unknown as string, {
    refetchOnWindowFocus: false,
  });

  if (!idCard) {
    return null;
  }

  return (
    <Modal opened={opened} onClose={onClose} centered size="md">
      {isLoadingTemplate ? (
        <Stack align="center" p="md">
          <Skeleton height={250} width={400} radius="md" />
          <Stack gap="xs" w="100%">
            <Skeleton height={12} width="60%" />
            <Skeleton height={12} width="40%" />
            <Skeleton height={12} width="80%" />
          </Stack>
        </Stack>
      ) : (
        data && <IDCardView templateData={data.template as TemplateData} data={{
            name: idCard.member?.name || null,
            ...idCard.request
        }} />
      )}
    </Modal>
  );
}
