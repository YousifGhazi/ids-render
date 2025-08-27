"use client";

import IDCardDesigner from '@/components/ids-designer';
import { useGetTemplate, useUpdateTemplate } from '@/features/templates/api';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { LoadingOverlay, Container } from '@mantine/core';

export default function EditForm() {
  const t = useTranslations();
  const params = useParams();
  const templateId = params.id as string;
  
  const { data: template, isLoading, error } = useGetTemplate(templateId);
  const updateTemplate = useUpdateTemplate();

  const onSaveHandler = (data: Record<string, unknown>) => {
    const templateData = {
      title: template?.title || `ID Card Template - ${new Date().toLocaleDateString()}`,
      template: data,
      is_enabled: template?.is_enabled || '1'
    };

    updateTemplate.mutate(
      { id: templateId, data: templateData },
      {
        onSuccess: () => {
          notifications.show({
            title: t('common.success'),
            message: t('templates.updateSuccess'),
            color: 'green'
          });
        },
        onError: (error) => {
          notifications.show({
            title: t('common.error'),
            message: t('templates.updateError'),
            color: 'red'
          });
          console.error('Error updating template:', error);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  if (error || !template) {
    return (
      <Container size="xl" py="xl">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>{t('common.error')}</h2>
          <p>{t('templates.loadError')}</p>
        </div>
      </Container>
    );
  }

  return (
    <IDCardDesigner 
      onSave={onSaveHandler} 
      initialData={template.template}
    />
  );
}
