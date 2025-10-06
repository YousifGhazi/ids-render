"use client";

import { IDCard } from "@/features/ids/types";
import { useGetTemplate } from "@/features/templates/api";
import { Modal, Skeleton, Stack, Text, Divider, Button } from "@mantine/core";
import { PolotnoImageRenderer } from "@/components/polotno-editor";
import { useTranslations } from "next-intl";

interface IdCardModalProps {
  idCard?: IDCard;
  opened: boolean;
  onClose: () => void;
}

export function IdCardModal({ idCard, opened, onClose }: IdCardModalProps) {
  const t = useTranslations();
  const { isLoading: isLoadingTemplate, data } = useGetTemplate(
    idCard?.template.id as unknown as string,
    {
      refetchOnWindowFocus: false,
    }
  );

  if (!idCard) {
    return null;
  }

  // Prepare the data for rendering the ID card
  const idCardData: Record<string, string> = {
    ...(idCard.request as Record<string, string>),
  };

  // Create front template with only the front page
  const template = data?.template as any;
  const frontTemplate =
    template && Array.isArray(template.pages)
      ? {
          ...template,
          pages: template.pages.slice(0, 1),
        }
      : null;

  // Create back template with only the back page (if it exists)
  const backTemplate =
    template && Array.isArray(template.pages) && template.pages.length > 1
      ? {
          ...template,
          pages: [template.pages[1]],
        }
      : null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      title={t("idsDesigner.templates.preview")}
    >
      {isLoadingTemplate ? (
        <Stack align="center" p="md">
          <Skeleton height={204} width={323} radius="md" />
          <Skeleton height={204} width={323} radius="md" />
        </Stack>
      ) : (
        data?.template && (
          <Stack gap="lg" p="md" align="center">
            {/* Front Side */}
            <Stack gap="sm" align="center">
              <Text size="sm" fw={600} c="dimmed">
                {t("ids.frontSide")}
              </Text>
              <PolotnoImageRenderer
                template={frontTemplate as Record<string, any>}
                data={idCardData}
                style={{
                  width: "323px",
                  height: "204px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              />
            </Stack>

            {/* Back Side - Only render if back page exists */}
            {backTemplate && (
              <>
                <Divider />
                <Stack gap="sm" align="center">
                  <Text size="sm" fw={600} c="dimmed">
                    {t("ids.backSide")}
                  </Text>
                  <PolotnoImageRenderer
                    template={backTemplate as Record<string, any>}
                    data={idCardData}
                    style={{
                      width: "323px",
                      height: "204px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                    }}
                  />
                </Stack>
              </>
            )}

            {/* Cancel Button */}
            <Button variant="default" color="gray" onClick={onClose} mt="md">
              {t("cancel")}
            </Button>
          </Stack>
        )
      )}
    </Modal>
  );
}
