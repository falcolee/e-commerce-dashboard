import { Suspense } from "react";
import { Area, type AreaConfig } from "@ant-design/plots";
import dayjs from "dayjs";
import { useTheme } from "next-themes";
import { Skeleton } from "antd";

type Props = {
  data: Array<{ timeText: string; value: number; state: string }>;
  height: number;
  loading?: boolean;
};

export const DailyRevenue = ({ data, height, loading = false }: Props) => {
  if (loading) {
    return (
      <div style={{ height, padding: '16px' }}>
        <Skeleton active />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '14px'
        }}
      >
        No revenue data available
      </div>
    );
  }
  const { theme } = useTheme();
  const mode = theme === "dark" ? "dark" : "light";

  const config: AreaConfig = {
    isStack: false,
    data,
    xField: "timeText",
    yField: "value",
    seriesField: "state",
    animation: true,
    startOnZero: false,
    smooth: true,
    legend: false,
    xAxis: {
      range: [0, 1],
      label: {
        formatter: (v) => dayjs(v).format(data.length > 7 ? "MM/DD" : "ddd"),
      },
    },
    yAxis: {
      label: {
        formatter: (v) => `$${Number(v) / 1000}k`,
      },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Daily Revenue",
        value: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(datum.value),
      }),
    },
    theme: mode,
    areaStyle: () =>
      mode === "dark"
        ? { fill: "l(270) 0:#15171B 0.5:#1677FF 1:#1677FF" }
        : { fill: "l(270) 0:#ffffff 0.5:#D3EBFF 1:#1677FF" },
    color: () => (mode === "dark" ? "#65A9F3" : "#1677FF"),
    line: {
      style: {
        stroke: mode === "dark" ? "#65A9F3" : "#1677FF",
        lineWidth: 2,
      },
    },
  };

  return (
    <Suspense>
      <Area {...config} height={height} />
    </Suspense>
  );
};
