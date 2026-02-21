"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, FileImage, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function RecentRecords() {
  const [data, setData] = React.useState<{ risk: any[]; imaging: any[] } | null>(null)
  const [loading, setLoading] = React.useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:5000/patients")
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error("Failed to fetch records")
    } finally {
      setLoading(false)
    }
  }

  // Load data automatically when page opens
  React.useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* LEFT: Recent Risk Assessments */}
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Activity className="h-4 w-4 text-primary" /> 
            Recent Patient Assessments
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {data?.risk?.map((record: any) => (
                <div key={record.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{record.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Age: {record.age} • {record.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={record.risk_level === "High" ? "destructive" : "outline"}>
                      {record.risk_level} Risk
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(record.prediction_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {(!data?.risk || data.risk.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-8">No records found.</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* RIGHT: Recent Imaging Scans */}
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <FileImage className="h-4 w-4 text-blue-500" /> 
            Imaging History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {data?.imaging?.map((scan: any) => (
                <div key={scan.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none truncate max-w-[150px]" title={scan.filename}>
                      {scan.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      AI Confidence: {scan.confidence}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={scan.prediction === "Malignant" ? "destructive" : "secondary"}>
                      {scan.prediction}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(scan.scan_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {(!data?.imaging || data.imaging.length === 0) && (
                 <p className="text-xs text-muted-foreground text-center py-8">No scans uploaded yet.</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}