"use client";

import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Center,
} from "@mantine/core";
import {
  IconLogin,
  IconMail,
  IconLock,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useLogin } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store";
import { useRouter } from "@/i18n/navigation";
import { notifications } from "@mantine/notifications";

export default function LoginPage() {
  const t = useTranslations("login");
  const router = useRouter();
  const login = useLogin();
  const { setAuth } = useAuthStore();

  const form = useForm({
    // mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },
    // validate: zodResolver(
    //   z.object({
    //     email: z.string().min(1, t("emailRequired")),
    //     password: z
    //       .string()
    //       .min(1, t("passwordRequired"))
    //       .min(6, t("passwordMinLength")),
    //   })
    // ),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    await login.mutateAsync(values, {
      onSuccess: (data) => {
        // Store user and token in Zustand store
        setAuth(data.user, data.accessToken);

        // Redirect to dashboard
        router.push("/");
      },
      onError: () => {
        notifications.show({
          position: "top-right",
          title: t("loginError"),
          message: t("loginError"),
          color: "red",
          icon: <IconAlertCircle />,
        });
      },
    });
  });

  return (
    <Container
      bg="#f8f9fa"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      size="xs"
      py={80}
      mih="100vh"
      miw="100vw"
    >
      <Paper w="100%" maw={500} p="xl" shadow="md" radius="md" withBorder>
        <Stack gap="lg">
          <Center>
            <Stack gap="xs" align="center">
              <IconLogin size={48} color="var(--mantine-color-blue-6)" />
              <Title order={2} ta="center" fw={600}>
                {t("title")}
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                {t("subtitle")}
              </Text>
            </Stack>
          </Center>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label={t("email")}
                placeholder={t("emailPlaceholder")}
                leftSection={<IconMail size={16} />}
                size="md"
                radius="md"
                key={form.key("email")}
                {...form.getInputProps("email")}
              />

              <PasswordInput
                label={t("password")}
                placeholder={t("passwordPlaceholder")}
                leftSection={<IconLock size={16} />}
                size="md"
                radius="md"
                key={form.key("password")}
                {...form.getInputProps("password")}
              />

              <Button
                type="submit"
                size="md"
                radius="md"
                fullWidth
                loading={login.isPending}
                leftSection={<IconLogin size={18} />}
                mt="md"
              >
                {login.isPending ? t("signingIn") : t("submitButton")}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}
