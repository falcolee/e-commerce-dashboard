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

export const NewCustomers = ({ data, height, loading = false }: Props) => {
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
        No customer data available
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
        formatter: (v) => `${Number(v)}`,
      },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "New Customers",
        value: Number(datum.value).toLocaleString(),
      }),
    },
    theme: mode,
    areaStyle: () =>
      mode === "dark"
        ? { fill: "l(270) 0:#0F1F1F 0.5:#1DC9C3 1:#0FB8AD" }
        : { fill: "l(270) 0:#ffffff 0.5:#C7F4F2 1:#13C2C2" },
    color: () => (mode === "dark" ? "#1DC9C3" : "#13C2C2"),
    line: {
      style: {
        stroke: mode === "dark" ? "#1DC9C3" : "#13C2C2",
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
