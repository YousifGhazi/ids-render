"use client";

import IDCardView from "@/components/ids-designer/id-card-view";
import { IDCard } from "@/features/ids/types";
import { useGetTemplate } from "@/features/templates/api";
import { Modal } from "@mantine/core";
import { modals } from "@mantine/modals";

interface IdCardModalProps {
  idCard?: IDCard;
  opened: boolean;
  onClose: () => void;
}

export function IdCardModal({ idCard, opened, onClose }: IdCardModalProps) {
  const {
    isLoading: isLoadingTemplate,
    data,
    refetch,
  } = useGetTemplate(idCard?.template.id as unknown as string, {
    refetchOnWindowFocus: false,
  });

  if (!idCard) {
    return null;
  }

  return (
    <Modal opened={opened} onClose={onClose} centered size="md">
      {data && <IDCardView templateData={data.template as any} data={{
        ...idCard.identity,
        name: idCard.member.name
      }} width={400} height={250} />}
    </Modal>
  );
}
