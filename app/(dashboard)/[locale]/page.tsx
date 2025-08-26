"use client";

import {
  Container,
  Paper,
  Grid,
  Title,
  Text,
  Group,
  Flex,
} from "@mantine/core";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

export default function Home() {
  const t = useTranslations("stats");
  const router = useRouter();

  // Static data for top 10 organizations
  const topOrganizationsList = [
    { id: 1, key: "ministryOfHealth" },
    { id: 2, key: "universityOfBaghdad" },
    { id: 3, key: "centralBank" },
    { id: 4, key: "ministryOfEducation" },
    { id: 5, key: "oilCompany" },
    { id: 6, key: "ministryOfInterior" },
    { id: 7, key: "baghdadMunicipality" },
    { id: 8, key: "ministryOfFinance" },
    { id: 9, key: "iraqiAirways" },
    { id: 10, key: "ministryOfTrade" },
  ];

  // Fake data for IDs issued over the year
  const idIssuedData = [
    { month: t("months.jan"), ids: 245 },
    { month: t("months.feb"), ids: 312 },
    { month: t("months.mar"), ids: 398 },
    { month: t("months.apr"), ids: 456 },
    { month: t("months.may"), ids: 523 },
    { month: t("months.jun"), ids: 678 },
    { month: t("months.jul"), ids: 743 },
    { month: t("months.aug"), ids: 825 },
    { month: t("months.sep"), ids: 892 },
    { month: t("months.oct"), ids: 967 },
    { month: t("months.nov"), ids: 1034 },
    { month: t("months.dec"), ids: 1156 },
  ];

  // Fake data for top 5 organizations
  const topOrganizationsData = [
    { name: t("organizations.ministryOfHealth"), ids: 1234 },
    { name: t("organizations.universityOfBaghdad"), ids: 987 },
    { name: t("organizations.centralBank"), ids: 856 },
    { name: t("organizations.ministryOfEducation"), ids: 743 },
    { name: t("organizations.oilCompany"), ids: 654 },
  ];

  // Fake data for departments/specializations
  const departmentsData = [
    { name: t("departments.healthcare"), value: 2345, color: "#8884d8" },
    { name: t("departments.education"), value: 1876, color: "#82ca9d" },
    { name: t("departments.finance"), value: 1432, color: "#ffc658" },
    { name: t("departments.engineering"), value: 1098, color: "#ff7300" },
    { name: t("departments.government"), value: 987, color: "#00ff88" },
    { name: t("departments.other"), value: 654, color: "#ff0088" },
  ];

  // Fake data for user growth over the year
  const userGrowthData = [
    { month: t("months.jan"), users: 1200 },
    { month: t("months.feb"), users: 1350 },
    { month: t("months.mar"), users: 1520 },
    { month: t("months.apr"), users: 1680 },
    { month: t("months.may"), users: 1890 },
    { month: t("months.jun"), users: 2100 },
    { month: t("months.jul"), users: 2340 },
    { month: t("months.aug"), users: 2580 },
    { month: t("months.sep"), users: 2820 },
    { month: t("months.oct"), users: 3100 },
    { month: t("months.nov"), users: 3380 },
    { month: t("months.dec"), users: 3650 },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
  }) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

    if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent) {
      return null;
    }

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Paper bg="#f8f9fa" mih={"100%"} p="xl">
      <Container size="xl">
        <Title order={2} mb="xl" ta="center">
          {t("title")}
        </Title>

        {/* Top Organizations Section */}
        <Paper
          shadow="md"
          p="xl"
          radius="md"
          mb="xl"
          bg="white"
          style={{ overflowX: "hidden" }}
        >
          <Group justify="space-between" align="flex-start" mb="lg">
            <div>
              <Title order={3} mb="xs">
                {t("topOrganizationsList")}
              </Title>
              {/* <Text size="sm" c="dimmed">
                {t("topOrganizationsDescription")}
              </Text> */}
            </div>
            <Text
              component="button"
              size="sm"
              c="blue"
              td="underline"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
                fontWeight: 500,
              }}
              onClick={() => router.push("/organizations")}
            >
              {t("viewAllOrganizations")}
            </Text>
          </Group>
          <Flex
            gap="xs"
            align="center"
            justify="center"
            style={{ flexWrap: "nowrap" }}
          >
            {topOrganizationsList.map((org, index) => (
              <>
                <Text
                  key={org.id}
                  size="md"
                  fw="bold"
                  c="dark.7"
                  style={{
                    whiteSpace: "nowrap",
                    // fontSize: "12px",
                  }}
                >
                  {t(`organizations.${org.key}`)}
                </Text>
                {index < topOrganizationsList.length - 1 && (
                  <Text size="xs" c="gray" fw={500} mx="2px">
                    |
                  </Text>
                )}
              </>
            ))}
          </Flex>
        </Paper>

        <Grid>
          {/* IDs Issued Over the Year */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" p="md" radius="md" h={400}>
              <Group justify="space-between" mb="md">
                <Title order={4}>{t("idsIssuedOverYear")}</Title>
                <Text size="lg" fw={700} c="blue">
                  {idIssuedData[idIssuedData.length - 1].ids.toLocaleString()}
                </Text>
              </Group>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={idIssuedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="ids"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid.Col>

          {/* Top 5 Organizations */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" p="md" radius="md" h={400}>
              <Group justify="space-between" mb="md">
                <Title order={4}>{t("topOrganizations")}</Title>
                <Text size="lg" fw={700} c="green">
                  {topOrganizationsData
                    .reduce((sum, org) => sum + org.ids, 0)
                    .toLocaleString()}
                </Text>
              </Group>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topOrganizationsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={10}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="ids" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid.Col>

          {/* Departments/Specializations */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" p="md" radius="md" h={400}>
              <Group justify="space-between" mb="md">
                <Title order={4}>{t("departmentsSpecializations")}</Title>
                <Text size="lg" fw={700} c="orange">
                  {departmentsData
                    .reduce((sum, dept) => sum + dept.value, 0)
                    .toLocaleString()}
                </Text>
              </Group>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid.Col>

          {/* User Growth Over the Year */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" p="md" radius="md" h={400}>
              <Group justify="space-between" mb="md">
                <Title order={4}>{t("userGrowthOverYear")}</Title>
                <Text size="lg" fw={700} c="purple">
                  {userGrowthData[
                    userGrowthData.length - 1
                  ].users.toLocaleString()}
                </Text>
              </Group>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#7c3aed"
                    fill="#7c3aed"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </Paper>
  );
}
