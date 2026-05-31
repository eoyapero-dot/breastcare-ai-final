"use client"

import * as React from "react"
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Activity,
  Calendar,
  Dna,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface Patient {
  patient_id: number;
  patient_name: string;
  diagnosis_age: number;
  race_category: string;
  tumor_stage: string;
  er_status: string;
  pr_status: string;
  her2_status: string;
  lymph_nodes_examined: number;
  risk_score: string;
  created_at: string;
}

interface PatientRegistryProps {
  onSelectPatient?: (patientId: string) => void
}

export function PatientRegistry({ onSelectPatient }: PatientRegistryProps) {
  const [patients, setPatients] = React.useState<Patient[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [selectedPatients, setSelectedPatients] = React.useState<string[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 5

  React.useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://localhost:5000/patients')
        const data = await response.json()
        setPatients(data.risk || [])
      } catch (error) {
        console.error("Failed to fetch registry data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPatients()
  }, [])

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `PT-${patient.patient_id}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.tumor_stage?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus =
      statusFilter === "all" ||
      patient.risk_score?.toLowerCase().replace(" ", "-") === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const togglePatientSelection = (patientId: string) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    )
  }

  const toggleAllSelection = () => {
    if (selectedPatients.length === paginatedPatients.length && paginatedPatients.length > 0) {
      setSelectedPatients([])
    } else {
      setSelectedPatients(paginatedPatients.map((p) => String(p.patient_id)))
    }
  }

  const getStatusBadgeClass = (status: string) => {
    if (status === "High Risk") return "bg-medical-danger/20 text-medical-danger border-medical-danger/30"
    if (status === "Low Risk") return "bg-medical-success/20 text-medical-success border-medical-success/30"
    return "bg-secondary text-secondary-foreground"
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Clinical Registry Database...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Patient Registry</h2>
          <p className="text-sm text-muted-foreground">
            Manage and monitor comprehensive clinical profiles
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add New Patient
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/50 bg-card/50 shadow-lg shadow-black/5">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Patients</p>
            <p className="text-2xl font-bold text-foreground">{patients.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 shadow-lg shadow-black/5">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">High Risk Identified</p>
            <p className="text-2xl font-bold text-medical-danger">
              {patients.filter((p) => p.risk_score === "High Risk").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 shadow-lg shadow-black/5">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Advanced Stage (III/IV)</p>
            <p className="text-2xl font-bold text-medical-warning">
              {patients.filter((p) => p.tumor_stage?.includes("III") || p.tumor_stage?.includes("IV")).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 shadow-lg shadow-black/5">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Recent Assessments</p>
            <p className="text-2xl font-bold text-foreground">
              {patients.filter((p) => {
                const date = new Date(p.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return date > weekAgo;
              }).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="border-border/50 bg-card/50 shadow-lg shadow-black/5">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or stage..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary/50 border-border/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-secondary/50 border-border/50">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Risk Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="high-risk">High Risk</SelectItem>
                  <SelectItem value="low-risk">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              {selectedPatients.length > 0 && (
                <Badge variant="secondary" className="mr-2">
                  {selectedPatients.length} selected
                </Badge>
              )}
              <Button variant="outline" size="sm" className="border-border/50 bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Table Area */}
      <Card className="border-border/50 bg-card/50 shadow-lg shadow-black/5">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        paginatedPatients.length > 0 &&
                        selectedPatients.length === paginatedPatients.length
                      }
                      onCheckedChange={toggleAllSelection}
                    />
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    <Button variant="ghost" size="sm" className="h-8 -ml-3 text-muted-foreground">
                      Patient
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-muted-foreground">Tumor Stage</TableHead>
                  <TableHead className="text-muted-foreground">ER / PR / HER2</TableHead>
                  <TableHead className="text-muted-foreground">AI Risk Score</TableHead>
                  <TableHead className="text-muted-foreground">Assessment Date</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No patients found matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPatients.map((patient) => (
                    <TableRow
                      key={patient.patient_id}
                      className="border-border/50 hover:bg-secondary/30 cursor-pointer"
                      onClick={() => onSelectPatient?.(String(patient.patient_id))}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedPatients.includes(String(patient.patient_id))}
                          onCheckedChange={() => togglePatientSelection(String(patient.patient_id))}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{patient.patient_name}</div>
                          <div className="text-xs text-muted-foreground">
                            PT-{patient.patient_id} · {patient.diagnosis_age} yrs
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Activity className="h-3 w-3 text-muted-foreground" />
                          {patient.tumor_stage}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Dna className="h-3 w-3" />
                          {patient.er_status?.charAt(0)} / {patient.pr_status?.charAt(0)} / {patient.her2_status?.charAt(0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getStatusBadgeClass(patient.risk_score)}
                        >
                          {patient.risk_score || "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(patient.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Clinical File
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-medical-danger">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Section */}
          {filteredPatients.length > 0 && (
            <div className="flex items-center justify-between border-t border-border/50 px-4 py-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredPatients.length)} of{" "}
                {filteredPatients.length} patients
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-border/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "h-8 w-8",
                        currentPage !== page && "border-border/50"
                      )}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-border/50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}