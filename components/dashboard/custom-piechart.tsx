"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChartDataItem {
  category: string;
  value: number;
  color: string;
}

interface CustomPieChartProps {
  chartData: ChartDataItem[];
  title?: string;
  description?: string;
}

const CustomTooltip = ({
  active,
  payload,
  chartData,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: ChartDataItem;
  }>;
  chartData: ChartDataItem[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const totalCount = chartData.reduce((sum, item) => sum + item.value, 0);
    const percentage = totalCount > 0 ? (data.value / totalCount) * 100 : 0;

    return (
      <div className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 p-3 rounded-lg shadow-lg">
        <p className="font-medium text-sm text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
          {data.name} ({percentage.toFixed(2)}%)
        </p>
        <p className="text-sm text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)]">
          Count: <span className="font-semibold">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)]">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export function CustomPieChart({
  chartData,
  title = "Code Smell Distribution",
  description = "Distribution of code smells by category",
}: CustomPieChartProps) {
  if (!chartData || chartData.length === 0) {
    return (
      <Card className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15">
        <CardHeader>
          <CardTitle className="text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
            {title}
          </CardTitle>
          <CardDescription className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)]">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)]">
            No code smells detected
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine if mobile based on screen width (will be client-side)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Card className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15">
      <CardHeader>
        <CardTitle className="text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
          {title}
        </CardTitle>
        <CardDescription className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)]">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={isMobile ? 100 : 130}
              innerRadius={isMobile ? 60 : 80}
              fill="#8884d8"
              dataKey="value"
              nameKey="category"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip chartData={chartData} />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
