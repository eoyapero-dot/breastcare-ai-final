"use client"

import * as React from "react"
import { 
  Activity, 
  BarChart3, 
  FileText, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  UserPlus, 
  Users, 
  AlertTriangle, 
  Clock 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Import your components
import { PatientIntake } from "@/components/dashboard/patient-intake"
import { ImagingAnalysis } from "@/components/dashboard/imaging-analysis"
import { RecentRecords } from "@/components/dashboard/recent-records"
import { RiskAssessment } from "@/components/dashboard/risk-assessment"
import { Settings } from "@/components/dashboard/settings"

export default function DashboardPage() {
  const [activeView, setActiveView] = React.useState("overview")
  const [stats, setStats] = React.useState({ 
    total: 0, 
    highRisk: 0, 
    today: 0, 
    avgTime: "4.2 days" 
  })
  const [recentPatients, setRecentPatients] = React.useState([])
  const [riskDistribution, setRiskDistribution] = React.useState({ low: 0, mid: 0, high: 0 })

  // --- FETCH REAL DATA FROM DATABASE ---
  React.useEffect(() => {
    if (activeView === "overview") {
      // Added timestamp to bust browser cache
      fetch(`http://127.0.0.1:5000/patients?t=${new Date().getTime()}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data.risk) {
            const patients = data.risk
            
            // 1. Calculate Stats (Using bulletproof risk checks)
            const highRiskCount = patients.filter((p: any) => String(p.risk_score || p.risk_level).includes('High')).length
            const midRiskCount = patients.filter((p: any) => String(p.risk_score || p.risk_level).includes('Moderate')).length
            const lowRiskCount = patients.filter((p: any) => String(p.risk_score || p.risk_level).includes('Low')).length
            
            // Check for patients added TODAY
            const todayStr = new Date().toISOString().split('T')[0]
            const todayCount = patients.filter((p: any) => {
               const dateStr = p.created_at || p.prediction_date;
               return dateStr && dateStr.startsWith(todayStr);
            }).length

            setStats({
              total: patients.length,
              highRisk: highRiskCount,
              today: todayCount, 
              avgTime: "4.2 days" 
            })

            // 2. Set Recent List (Top 5)
            setRecentPatients(patients.slice(0, 5))

            // 3. Calculate Distribution Percentages
            const total = patients.length || 1 
            setRiskDistribution({
              high: (highRiskCount / total) * 100,
              mid: (midRiskCount / total) * 100,
              low: (lowRiskCount / total) * 100
            })
          }
        })
        .catch(e => console.error("Database connection error:", e))
    }
  }, [activeView])

  // --- VIEW SWITCHER ---
  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* TOP CARDS */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.highRisk}</div>
                  <p className="text-xs text-muted-foreground">Requires immediate follow-up</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assessments Today</CardTitle>
                  <Activity className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.today}</div>
                  <p className="text-xs text-muted-foreground">Completed screenings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Wait Time</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgTime}</div>
                  <p className="text-xs text-muted-foreground">-15% to first appointment</p>
                </CardContent>
              </Card>
            </div>

            {/* BOTTOM SECTION */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              
              {/* RECENT ASSESSMENTS LIST (Left) */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Assessments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {recentPatients.length === 0 ? (
                       <p className="text-sm text-muted-foreground">No records found in database.</p>
                    ) : (
                      recentPatients.map((patient: any, index) => {
                        // BULLETPROOF VARIABLES
                        const pName = patient.patient_name || patient.full_name || "Unknown Patient";
                        const pStage = patient.tumor_stage || patient.location || "Stage N/A";
                        const pAge = patient.diagnosis_age || patient.age;
                        const pRisk = patient.risk_score || patient.risk_level || "Pending";
                        const isHighRisk = String(pRisk).includes("High");

                        return (
                          <div key={patient.patient_id || index} className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">{pName}</p>
                              <p className="text-xs text-muted-foreground">
                                {pStage} • {pAge ? `${pAge} yrs` : "Age N/A"}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-24 sm:w-32">
                                <Progress 
                                  value={isHighRisk ? 85 : 20} 
                                  className={isHighRisk ? "h-2 bg-red-100 [&>div]:bg-red-500" : "h-2 bg-blue-100 [&>div]:bg-blue-500"} 
                                />
                              </div>
                              <Badge variant={isHighRisk ? 'destructive' : 'secondary'}>
                                {pRisk}
                              </Badge>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* RISK DISTRIBUTION (Right) */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Low Risk (0-30%)</span>
                      <span className="font-bold">{Math.round(riskDistribution.low)}%</span>
                    </div>
                    <Progress value={riskDistribution.low} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Moderate (31-60%)</span>
                      <span className="font-bold">{Math.round(riskDistribution.mid)}%</span>
                    </div>
                    <Progress value={riskDistribution.mid} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">High Risk (61-100%)</span>
                      <span className="font-bold">{Math.round(riskDistribution.high)}%</span>
                    </div>
                    <Progress value={riskDistribution.high} className="h-2 [&>div]:bg-destructive" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "intake": return <PatientIntake />
      case "risk": return <RiskAssessment />
      case "imaging": return <ImagingAnalysis />
      case "registry": return <RecentRecords />
      case "settings": return <Settings />
      default: return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* SIDEBAR - REVERTED TO ORIGINAL BG AND CLASSES */}
        <aside className="hidden w-[240px] flex-col border-r bg-muted/10 md:flex">
          <div className="flex h-14 items-center border-b px-6 font-semibold lg:h-[60px]">
            <Activity className="mr-2 h-6 w-6 text-primary" />
            <span>BreastCare AI</span>
          </div>
          <ScrollArea className="flex-1">
            <nav className="grid items-start px-4 text-sm font-medium lg:px-6 py-6 gap-2">
              <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                Navigation
              </div>
              
              {/* REVERTED LABELS */}
              <Button 
                variant={activeView === "overview" ? "secondary" : "ghost"} 
                className="justify-start gap-2" 
                onClick={() => setActiveView("overview")}
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Button>

              <Button 
                variant={activeView === "intake" ? "secondary" : "ghost"} 
                className="justify-start gap-2" 
                onClick={() => setActiveView("intake")}
              >
                <UserPlus className="h-4 w-4" /> New Patient Intake
              </Button>

              <Button 
                variant={activeView === "risk" ? "secondary" : "ghost"} 
                className="justify-start gap-2" 
                onClick={() => setActiveView("risk")}
              >
                <BarChart3 className="h-4 w-4" /> Risk Assessment
              </Button>

              <Button 
                variant={activeView === "imaging" ? "secondary" : "ghost"} 
                className="justify-start gap-2" 
                onClick={() => setActiveView("imaging")}
              >
                <FileText className="h-4 w-4" /> Imaging Analysis
              </Button>

              <Button 
                variant={activeView === "registry" ? "secondary" : "ghost"} 
                className="justify-start gap-2" 
                onClick={() => setActiveView("registry")}
              >
                <Users className="h-4 w-4" /> Patient Registry
              </Button>

              <div className="mt-6 px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                System
              </div>
              
              <Button 
                variant={activeView === "settings" ? "secondary" : "ghost"} 
                className="justify-start gap-2" 
                onClick={() => setActiveView("settings")}
              >
                <SettingsIcon className="h-4 w-4" /> System Settings
              </Button>
            </nav>
          </ScrollArea>
        </aside>

        {/* MAIN CONTENT - REVERTED TO ORIGINAL BG */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/5">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl capitalize">
              {activeView === "overview" ? "Dashboard" : activeView.replace("-", " ")}
            </h1>
          </div>
          
          <div className="flex-1">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}