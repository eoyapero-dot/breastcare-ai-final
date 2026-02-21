"use client"

import * as React from "react"
import { Upload, FileImage, Activity, Brain, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export function ImagingAnalysis() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [result, setResult] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setResult(null)
      setError(null)
    }
  }

  const handleAnalyze = async () => {
    if (!file) return
    setIsAnalyzing(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("http://127.0.0.1:5000/upload_image", {
        method: "POST",
        body: formData,
      })
      if (!response.ok) throw new Error("Analysis failed")
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError("Could not connect to the AI model.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // --- SAVE FUNCTION ---
  const handleSave = async () => {
    if (!result) return
    setIsSaving(true)
    try {
      const response = await fetch("http://127.0.0.1:5000/save_imaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: result.filename || file?.name,
          prediction: result.prediction,
          confidence: result.confidence
        })
      })

      if (response.ok) {
        alert("✅ Result successfully saved to Patient Records!")
      } else {
        alert("❌ Failed to save.")
      }
    } catch (e) {
      console.error(e)
      alert("❌ Error connecting to database.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* LEFT COLUMN: Upload */}
      <div className="space-y-6">
        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Scan
            </CardTitle>
            <CardDescription>Supported: JPG, PNG (Max 10MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 py-12 text-center transition-colors hover:bg-muted/80">
              {preview ? (
                <div className="relative aspect-square w-64 overflow-hidden rounded-lg border bg-black">
                  <img src={preview} alt="Preview" className="h-full w-full object-contain" />
                  <Button variant="destructive" size="sm" className="absolute right-2 top-2" onClick={() => { setFile(null); setPreview(null); setResult(null); }}>Remove</Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 rounded-full bg-primary/10 p-4"><FileImage className="h-8 w-8 text-primary" /></div>
                  <h3 className="mb-1 text-lg font-semibold">Drag image here</h3>
                  <Button asChild variant="secondary"><label className="cursor-pointer">Select File<input type="file" className="hidden" accept="image/*" onChange={handleFileChange} /></label></Button>
                </>
              )}
            </div>
            {file && !result && (
              <Button className="mt-6 w-full" size="lg" onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? "Processing..." : "Run Analysis"}
              </Button>
            )}
            {error && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Results */}
      <div className="space-y-6">
        {result ? (
          <Card className="border-primary/20 bg-primary/5 shadow-lg">
            <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> AI Results</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div><p className="text-sm font-medium text-muted-foreground">Classification</p><h3 className="text-2xl font-bold tracking-tight">{result.prediction}</h3></div>
                <Badge variant={result.prediction === "Malignant" ? "destructive" : "secondary"} className="px-4 py-1 text-base">{result.confidence} Confidence</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
                  <img src={preview!} alt="Original" className="absolute inset-0 h-full w-full object-contain opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-red-500/30 mix-blend-overlay" />
                  <div className="flex h-full items-center justify-center"><p className="rounded-md bg-black/70 px-3 py-1 text-xs text-white">Heatmap Overlay Active</p></div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" variant="outline">Download Report</Button>
                
                {/* ACTIVE SAVE BUTTON */}
                <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : <>Save to Patient Record <Save className="ml-2 h-4 w-4" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex h-full flex-col justify-center border-dashed border-muted-foreground/25 bg-muted/10">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Activity className="mb-4 h-12 w-12 opacity-20" />
              <h3 className="text-lg font-semibold">No Analysis Yet</h3>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}