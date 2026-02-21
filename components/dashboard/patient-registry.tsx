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
  MapPin,
  Calendar,
  AlertTriangle,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Progress } from "@/components/ui/progress"

const patients = [
  {
    id: "PT-2847",
    name: "Maria Santos",
    age: 52,
    location: "Rural Clinic A",
    riskScore: 78,
    status: "High Risk",
    lastVisit: "2024-01-15",
    nextFollowUp: "2024-01-20",
    insurance: "None",
  },
  {
    id: "PT-2846",
    name: "Elena Rodriguez",
    age: 45,
    location: "District Hospital",
    riskScore: 42,
    status: "Moderate",
    lastVisit: "2024-01-14",
    nextFollowUp: "2024-02-14",
    insurance: "Public",
  },
  {
    id: "PT-2845",
    name: "Ana Martinez",
    age: 61,
    location: "Mobile Unit B",
    riskScore: 89,
    status: "Critical",
    lastVisit: "2024-01-15",
    nextFollowUp: "2024-01-17",
    insurance: "None",
  },
  {
    id: "PT-2844",
    name: "Carmen Lopez",
    age: 38,
    location: "Urban Center",
    riskScore: 23,
    status: "Low Risk",
    lastVisit: "2024-01-10",
    nextFollowUp: "2024-07-10",
    insurance: "Private",
  },
  {
    id: "PT-2843",
    name: "Isabella Garcia",
    age: 55,
    location: "Rural Clinic B",
    riskScore: 65,
    status: "Moderate",
    lastVisit: "2024-01-12",
    nextFollowUp: "2024-02-12",
    insurance: "Public",
  },
  {
    id: "PT-2842",
    name: "Sofia Hernandez",
    age: 49,
    location: "District Hospital",
    riskScore: 71,
    status: "High Risk",
    lastVisit: "2024-01-11",
    nextFollowUp: "2024-01-18",
    insurance: "None",
  },
  {
    id: "PT-2841",
    name: "Lucia Gonzalez",
    age: 63,
    location: "Mobile Unit A",
    riskScore: 34,
    status: "Moderate",
    lastVisit: "2024-01-09",
    nextFollowUp: "2024-02-09",
    insurance: "Public",
  },
  {
    id: "PT-2840",
    name: "Rosa Ramirez",
    age: 57,
    location: "Rural Clinic A",
    riskScore: 82,
    status: "Critical",
    lastVisit: "2024-01-14",
    nextFollowUp: "2024-01-16",
    insurance: "None",
  },
]

interface PatientRegistryProps {
  onSelectPatient?: (patientId: string) => void
}

export function PatientRegistry({ onSelectPatient }: PatientRegistryProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [selectedPatients, setSelectedPatients] = React.useState<string[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 5

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus =
      statusFilter === "all" ||
      patient.status.toLowerCase().replace(" ", "-") === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
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
    if (selectedPatients.length === paginatedPatients.length) {
      setSelectedPatients([])
    } else {
      setSelectedPatients(paginatedPatients.map((p) => p.id))
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Critical":
        return "bg-medical-danger/20 text-medical-danger border-medical-danger/30"
      case "High Risk":
        return "bg-primary/20 text-primary border-primary/30"
      case "Moderate":
        return "bg-medical-warning/20 text-medical-warning border-medical-warning/30"
      case "Low Risk":
        return "bg-medical-success/20 text-medical-success border-medical-success/30"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Patient Registry</h2>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all registered patients
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
            <p className="text-sm text-muted-foreground">Critical/High Risk</p>
            <p className="text-2xl font-bold text-medical-danger">
              {patients.filter((p) => p.status === "Critical" || p.status === "High Risk").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 shadow-lg shadow-black/5">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending Follow-ups</p>
            <p className="text-2xl font-bold text-medical-warning">12</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 shadow-lg shadow-black/5">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Uninsured</p>
            <p className="text-2xl font-bold text-foreground">
              {patients.filter((p) => p.insurance === "None").length}
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
                  placeholder="Search by name, ID, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary/50 border-border/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-secondary/50 border-border/50">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high-risk">High Risk</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
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

      {/* Patient Table */}
      <Card className="border-border/50 bg-card/50 shadow-lg shadow-black/5">
        <CardContent className="p-0">
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
                <TableHead className="text-muted-foreground">Location</TableHead>
                <TableHead className="text-muted-foreground">Risk Score</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Last Visit</TableHead>
                <TableHead className="text-muted-foreground">Follow-up</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPatients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="border-border/50 hover:bg-secondary/30 cursor-pointer"
                  onClick={() => onSelectPatient?.(patient.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedPatients.includes(patient.id)}
                      onCheckedChange={() => togglePatientSelection(patient.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{patient.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {patient.id} · {patient.age} years
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {patient.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16">
                        <Progress
                          value={patient.riskScore}
                          className={cn(
                            "h-2",
                            patient.riskScore >= 80
                              ? "[&>div]:bg-medical-danger"
                              : patient.riskScore >= 60
                              ? "[&>div]:bg-primary"
                              : patient.riskScore >= 30
                              ? "[&>div]:bg-medical-warning"
                              : "[&>div]:bg-medical-success"
                          )}
                        />
                      </div>
                      <span className="text-sm font-medium">{patient.riskScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusBadgeClass(patient.status)}
                    >
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(patient.lastVisit).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {new Date(patient.nextFollowUp) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                        <AlertTriangle className="h-3 w-3 text-medical-warning" />
                      )}
                      <span className={cn(
                        "text-sm",
                        new Date(patient.nextFollowUp) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                          ? "text-medical-warning font-medium"
                          : "text-muted-foreground"
                      )}>
                        {new Date(patient.nextFollowUp).toLocaleDateString()}
                      </span>
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
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Patient
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
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
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
        </CardContent>
      </Card>
    </div>
  )
}
