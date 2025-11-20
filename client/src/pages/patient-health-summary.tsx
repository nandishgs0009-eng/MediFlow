import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Calendar, Target } from "lucide-react";
import { format, parseISO } from "date-fns";

interface AdherenceData {
  date?: string;
  month?: string;
  totalScheduled: number;
  totalTaken: number;
  percentage: number;
}

export default function HealthSummaryPage() {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");

  const { data: dailyAdherence = [], isLoading: loadingDaily } = useQuery<AdherenceData[]>({
    queryKey: ["/api/health/daily-adherence", { days: parseInt(timeRange) }],
    queryFn: async () => {
      const res = await fetch(`/api/health/daily-adherence?days=${timeRange}`);
      return res.json();
    },
  });

  const { data: monthlyAdherence = [], isLoading: loadingMonthly } = useQuery<AdherenceData[]>({
    queryKey: ["/api/health/monthly-adherence"],
    queryFn: async () => {
      const res = await fetch("/api/health/monthly-adherence?months=12");
      return res.json();
    },
  });

  const calculateStats = (data: AdherenceData[]) => {
    if (data.length === 0) return { average: 0, best: 0, worst: 0 };
    
    const percentages = data.map(d => d.percentage);
    const average = percentages.reduce((a, b) => a + b, 0) / percentages.length;
    const best = Math.max(...percentages);
    const worst = Math.min(...percentages);
    
    return { average, best, worst };
  };

  const dailyStats = calculateStats(dailyAdherence);
  const monthlyStats = calculateStats(monthlyAdherence);

  const getAdherenceColor = (percentage: number) => {
    if (percentage >= 80) return "#22c55e"; // green
    if (percentage >= 60) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const pieData = dailyAdherence.slice(-7).map(day => ({
    name: day.date ? format(parseISO(day.date), "EEE") : day.month || "",
    value: day.totalTaken,
  }));

  if (loadingDaily || loadingMonthly) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Health Summary</h1>
        <p className="text-muted-foreground mt-2">Track your medication adherence and health trends</p>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="monthly">Monthly View</TabsTrigger>
        </TabsList>

        {/* Daily View */}
        <TabsContent value="daily" className="space-y-6">
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {["7", "30", "90"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as "7" | "30" | "90")}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  timeRange === range
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                Last {range} Days
              </button>
            ))}
          </div>

          {/* Daily Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Adherence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dailyStats.average.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Over the last {timeRange} days</p>
                <Badge
                  className={`mt-3 ${
                    dailyStats.average >= 80
                      ? "bg-green-500/20 text-green-700 dark:text-green-400"
                      : dailyStats.average >= 60
                      ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                      : "bg-red-500/20 text-red-700 dark:text-red-400"
                  }`}
                >
                  {dailyStats.average >= 80 ? "Excellent" : dailyStats.average >= 60 ? "Good" : "Needs Improvement"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Best Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{dailyStats.best.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Highest adherence rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lowest Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{dailyStats.worst.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Lowest adherence rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Adherence Trend</CardTitle>
              <CardDescription>Your medication adherence over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyAdherence.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No data available for this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyAdherence}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        date ? format(parseISO(date), "MM/dd") : ""
                      }
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                      labelFormatter={(label) =>
                        label ? format(parseISO(label), "PPp") : ""
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Adherence %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Daily Detail Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Details</CardTitle>
              <CardDescription>Breakdown of medicines taken vs scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-center py-3 px-4 font-semibold">Taken</th>
                      <th className="text-center py-3 px-4 font-semibold">Scheduled</th>
                      <th className="text-center py-3 px-4 font-semibold">Adherence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyAdherence.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-muted-foreground">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      dailyAdherence.map((day, index) => (
                        <tr key={index} className="border-b hover:bg-accent/50">
                          <td className="py-3 px-4">
                            {day.date
                              ? format(parseISO(day.date), "PPp")
                              : day.month || "-"}
                          </td>
                          <td className="text-center py-3 px-4 font-medium">
                            {day.totalTaken}
                          </td>
                          <td className="text-center py-3 px-4">
                            {day.totalScheduled}
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: getAdherenceColor(day.percentage) }}
                              />
                              <span className="font-semibold">{day.percentage.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly View */}
        <TabsContent value="monthly" className="space-y-6">
          {/* Monthly Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Monthly Adherence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{monthlyStats.average.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Over the last 12 months</p>
                <Badge
                  className={`mt-3 ${
                    monthlyStats.average >= 80
                      ? "bg-green-500/20 text-green-700 dark:text-green-400"
                      : monthlyStats.average >= 60
                      ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                      : "bg-red-500/20 text-red-700 dark:text-red-400"
                  }`}
                >
                  {monthlyStats.average >= 80 ? "Excellent" : monthlyStats.average >= 60 ? "Good" : "Needs Improvement"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Best Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{monthlyStats.best.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Highest monthly adherence</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lowest Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{monthlyStats.worst.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Lowest monthly adherence</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Adherence Overview</CardTitle>
              <CardDescription>Your medication adherence by month for the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyAdherence.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyAdherence}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                    <Legend />
                    <Bar
                      dataKey="percentage"
                      fill="#3b82f6"
                      name="Adherence %"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Monthly Detail Table */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Details</CardTitle>
              <CardDescription>Breakdown of medicines taken vs scheduled by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Month</th>
                      <th className="text-center py-3 px-4 font-semibold">Taken</th>
                      <th className="text-center py-3 px-4 font-semibold">Scheduled</th>
                      <th className="text-center py-3 px-4 font-semibold">Adherence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyAdherence.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-muted-foreground">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      monthlyAdherence.map((month, index) => (
                        <tr key={index} className="border-b hover:bg-accent/50">
                          <td className="py-3 px-4 font-medium">{month.month}</td>
                          <td className="text-center py-3 px-4">
                            {month.totalTaken}
                          </td>
                          <td className="text-center py-3 px-4">
                            {month.totalScheduled}
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: getAdherenceColor(month.percentage) }}
                              />
                              <span className="font-semibold">{month.percentage.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
