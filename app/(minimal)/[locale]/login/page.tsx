"use client";

import { useForm } from "@mantine/form";
import {
  Container,
  Paper,
  TextInput,
  Button,
  Title,
  Text,
  Stack,
  Center,
  NumberInput,
  Box,
} from "@mantine/core";
import { IconLogin, IconAlertCircle, IconPhone } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useLogin, useSendOTP } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store";
import { useRouter } from "@/i18n/navigation";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { LoginHeader } from "@/components/login-header";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const login = useLogin();
  const sendOTP = useSendOTP();
  const { setAuth } = useAuthStore();

  const [phone, setPhone] = useState("");

  const form = useForm<{
    otp: string | undefined;
    phone: string;
  }>({
    initialValues: {
      phone: "",
      otp: undefined,
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (values?.otp) {
      await login.mutateAsync(
        { phone, otp: String(values.otp) },
        {
          onSuccess: (data) => {
            setAuth(data.user, data.accessToken);
            router.push("/");
          },
          onError: () => {
            notifications.show({
              position: "bottom-right",
              title: t("login.loginError"),
              message: t("login.loginError"),
              color: "red",
              icon: <IconAlertCircle />,
            });
          },
        }
      );
    }

    if (!phone) {
      setPhone(values.phone);
      await sendOTP.mutateAsync({ phone: values.phone });
    }
  });

  return (
    <Box>
      <LoginHeader />
      <Container
        bg="#f8f9fa"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        size="xs"
        py={80}
        pt={120} // Added padding top to account for fixed header
        mih="100vh"
        miw="100vw"
      >
        <Paper w="100%" maw={500} p="xl" shadow="md" radius="md" withBorder>
          <Stack gap="lg">
            <Center>
              <Stack gap="xs" align="center">
                <IconLogin size={48} color="var(--mantine-color-blue-6)" />
                <Title order={2} ta="center" fw={600}>
                  {t("login.title")}
                </Title>
                <Text size="sm" c="dimmed" ta="center">
                  {t("login.subtitle")}
                </Text>
              </Stack>
            </Center>

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label={t("phoneNumber")}
                  placeholder={t("phoneNumber")}
                  leftSection={<IconPhone size={16} />}
                  size="md"
                  radius="md"
                  key={form.key("phone")}
                  {...form.getInputProps("phone")}
                />
                {phone && (
                  <NumberInput
                    label={t("login.otp")}
                    placeholder={t("login.otp")}
                    leftSection={<IconAlertCircle size={16} />}
                    rightSection=" "
                    size="md"
                    radius="md"
                    key={form.key("otp")}
                    {...form.getInputProps("otp")}
                  />
                )}

                <Button
                  type="submit"
                  size="md"
                  radius="md"
                  fullWidth
                  loading={login.isPending}
                  leftSection={<IconLogin size={18} />}
                  mt="md"
                >
                  {login.isPending
                    ? t("login.signingIn")
                    : t("login.submitButton")}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
