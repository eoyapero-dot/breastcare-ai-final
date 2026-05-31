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
  Dna,
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

interface Patient {
  patient_id: number;
  patient_name: string;
  diagnosis_age: number;
  tumor_stage: string;
  risk_score: string;
  created_at: string;
}

export default function DashboardOverview() {
  const [patients, setPatients] = React.useState<Patient[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/patients')
        const data = await response.json()
        setPatients(data.risk || [])
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const totalPatients = patients.length
  const highRiskCount = patients.filter(p => p.risk_score === "High Risk").length
  const lowRiskCount = patients.filter(p => p.risk_score === "Low Risk").length
  
  const recentAssessmentsCount = patients.filter(p => {
    if (!p.created_at) return false;
    const date = new Date(p.created_at);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date > yesterday;
  }).length

  const highRiskPercent = totalPatients > 0 ? Math.round((highRiskCount / totalPatients) * 100) : 0
  const lowRiskPercent = totalPatients > 0 ? Math.round((lowRiskCount / totalPatients) * 100) : 0

  const stats = [
    {
      title: "Total Patients",
      value: totalPatients.toString(),
      change: "+2 this week",
      trend: "up" as const,
      icon: Users,
      description: "registered in system",
    },
    {
      title: "High Risk Cases",
      value: highRiskCount.toString(),
      change: "Action Required",
      trend: "up" as const,
      icon: AlertTriangle,
      description: "AI identified risk",
    },
    {
      title: "Recent Assessments",
      value: recentAssessmentsCount.toString(),
      change: "Active",
      trend: "up" as const,
      icon: Activity,
      description: "in the last 24 hours",
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

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center text-muted-foreground animate-pulse">Loading Clinical Overview...</div>
  }

  return (
    <div className="space-y-6">
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
                <span className={stat.trend === "up" ? "text-medical-success" : "text-medical-danger"}>
                  {stat.change}
                </span>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="col-span-2 border-border/50 bg-card/50 shadow-lg shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Assessments</CardTitle>
              <p className="text-sm text-muted-foreground">Latest AI patient risk evaluations</p>
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
                  <TableHead className="text-muted-foreground">Risk Level</TableHead>
                  <TableHead className="text-muted-foreground">Tumor Stage</TableHead>
                  <TableHead className="text-right text-muted-foreground">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.slice(0, 5).map((patient) => (
                  <TableRow key={patient.patient_id} className="border-border/50 hover:bg-secondary/30 cursor-pointer">
                    <TableCell>
                      <div>
                        {/* SAFE FALLBACKS ADDED HERE */}
                        <div className="font-medium text-foreground">{patient.patient_name || "Unknown Patient"}</div>
                        <div className="text-xs text-muted-foreground">
                          PT-{patient.patient_id || "N/A"} · {patient.diagnosis_age ? `${patient.diagnosis_age} yrs` : "Age N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={patient.risk_score === "High Risk" ? "bg-medical-danger/20 text-medical-danger border-medical-danger/30" : patient.risk_score === "Low Risk" ? "bg-medical-success/20 text-medical-success border-medical-success/30" : "bg-secondary"}>
                        {patient.risk_score || "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Dna className="h-3 w-3" />
                        {patient.tumor_stage || "Stage N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : "Date N/A"}
                    </TableCell>
                  </TableRow>
                ))}
                {patients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No patients in database yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">AI Risk Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Patient population by prediction</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-red-600">High Risk Classifications</span>
                <span className="font-bold">{highRiskPercent}%</span>
              </div>
              <Progress value={highRiskPercent} className="h-2 [&>div]:bg-red-500" />
              <p className="text-xs text-muted-foreground text-right">{highRiskCount} patients</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-green-600">Low Risk Classifications</span>
                <span className="font-bold">{lowRiskPercent}%</span>
              </div>
              <Progress value={lowRiskPercent} className="h-2 [&>div]:bg-green-500" />
              <p className="text-xs text-muted-foreground text-right">{lowRiskCount} patients</p>
            </div>

            <div className="mt-6 rounded-lg bg-red-50 border border-red-100 p-4">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-bold text-red-700">Action Required</span>
              </div>
              <p className="mt-1 text-xs text-red-600">
                {highRiskCount} high-risk patients require follow-up based on AI predictions.
              </p>
              <Button size="sm" className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white border-0">
                Review Cases
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}