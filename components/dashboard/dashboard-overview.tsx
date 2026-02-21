"use client"

import * as React from "react"
import {
  Users,
  AlertTriangle,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MapPin,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const stats = [
  {
    title: "Total Patients",
    value: "2,847",
    change: "+12%",
    trend: "up" as const,
    icon: Users,
    description: "from last month",
  },
  {
    title: "High Risk Cases",
    value: "127",
    change: "+8%",
    trend: "up" as const,
    icon: AlertTriangle,
    description: "requiring follow-up",
  },
  {
    title: "Assessments Today",
    value: "34",
    change: "-3%",
    trend: "down" as const,
    icon: Activity,
    description: "completed screenings",
  },
  {
    title: "Avg. Wait Time",
    value: "4.2 days",
    change: "-15%",
    trend: "down" as const,
    icon: Clock,
    description: "to first appointment",
  },
]

const recentPatients = [
  {
    id: "PT-2847",
    name: "Maria Santos",
    age: 52,
    riskScore: 78,
    status: "High Risk",
    location: "Rural Clinic A",
    lastAssessment: "2 hours ago",
  },
  {
    id: "PT-2846",
    name: "Elena Rodriguez",
    age: 45,
    riskScore: 42,
    status: "Moderate",
    location: "District Hospital",
    lastAssessment: "4 hours ago",
  },
  {
    id: "PT-2845",
    name: "Ana Martinez",
    age: 61,
    riskScore: 89,
    status: "Critical",
    location: "Mobile Unit B",
    lastAssessment: "6 hours ago",
  },
  {
    id: "PT-2844",
    name: "Carmen Lopez",
    age: 38,
    riskScore: 23,
    status: "Low Risk",
    location: "Urban Center",
    lastAssessment: "8 hours ago",
  },
  {
    id: "PT-2843",
    name: "Isabella Garcia",
    age: 55,
    riskScore: 65,
    status: "Moderate",
    location: "Rural Clinic B",
    lastAssessment: "12 hours ago",
  },
]

const riskDistribution = [
  { label: "Low Risk (0-30%)", count: 1842, percentage: 65, color: "bg-medical-success" },
  { label: "Moderate (31-60%)", count: 678, percentage: 24, color: "bg-medical-warning" },
  { label: "High Risk (61-80%)", count: 254, percentage: 9, color: "bg-primary" },
  { label: "Critical (81-100%)", count: 73, percentage: 2, color: "bg-medical-danger" },
]

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50 bg-card/50 shadow-lg shadow-black/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-medical-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-medical-danger" />
                )}
                <span
                  className={
                    stat.trend === "up" ? "text-medical-success" : "text-medical-danger"
                  }
                >
                  {stat.change}
                </span>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Patients Table */}
        <Card className="col-span-2 border-border/50 bg-card/50 shadow-lg shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Assessments</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest patient risk evaluations
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Patient</TableHead>
                  <TableHead className="text-muted-foreground">Risk Score</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Location</TableHead>
                  <TableHead className="text-right text-muted-foreground">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPatients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="border-border/50 hover:bg-secondary/30 cursor-pointer"
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{patient.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {patient.id} · {patient.age} years
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <Progress
                            value={patient.riskScore}
                            className="h-2 bg-secondary"
                          />
                        </div>
                        <span className="text-sm font-medium">{patient.riskScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          patient.status === "Critical"
                            ? "bg-medical-danger/20 text-medical-danger border-medical-danger/30"
                            : patient.status === "High Risk"
                            ? "bg-primary/20 text-primary border-primary/30"
                            : patient.status === "Moderate"
                            ? "bg-medical-warning/20 text-medical-warning border-medical-warning/30"
                            : "bg-medical-success/20 text-medical-success border-medical-success/30"
                        }
                      >
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {patient.location}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {patient.lastAssessment}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card className="border-border/50 bg-card/50 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Risk Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Patient population by risk level
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskDistribution.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.count}</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="mt-6 rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-medical-warning" />
                <span className="font-medium text-foreground">Action Required</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                127 high-risk patients require follow-up within 48 hours
              </p>
              <Button size="sm" className="mt-3 w-full" variant="secondary">
                Review Cases
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Insights */}
      <Card className="border-border/50 bg-card/50 shadow-lg shadow-black/5">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Regional Overview</CardTitle>
          <p className="text-sm text-muted-foreground">
            Risk distribution across healthcare facilities
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { name: "Rural Clinic A", patients: 342, highRisk: 45, distance: "45 km" },
              { name: "Rural Clinic B", patients: 287, highRisk: 32, distance: "62 km" },
              { name: "District Hospital", patients: 892, highRisk: 78, distance: "12 km" },
              { name: "Mobile Unit B", patients: 156, highRisk: 21, distance: "Variable" },
            ].map((facility) => (
              <div
                key={facility.name}
                className="rounded-lg border border-border/50 bg-secondary/30 p-4"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{facility.name}</span>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Patients</span>
                    <span className="font-medium">{facility.patients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">High Risk</span>
                    <span className="font-medium text-medical-danger">{facility.highRisk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Distance</span>
                    <span className="font-medium">{facility.distance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
