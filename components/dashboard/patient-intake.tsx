"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  User,
  History,
  Dna,
  Activity,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// 1. Updated Zod Schema mapping directly to TCGA Dataset Needs
const patientSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  diagnosis_age: z.number().min(18, "Patient must be at least 18 years old").max(120),
  race_category: z.enum(["WHITE", "BLACK OR AFRICAN AMERICAN", "ASIAN", "OTHER"]),
  menopause_status: z.enum(["Pre", "Peri", "Post"]),
  prior_cancer: z.enum(["No", "Yes"]),
  er_status: z.enum(["Positive", "Negative"]),
  pr_status: z.enum(["Positive", "Negative"]),
  her2_status: z.enum(["Positive", "Negative"]),
  tumor_stage: z.enum(["Stage I", "Stage IIA", "Stage IIB", "Stage IIIA", "Stage IV"]),
  histology_type: z.enum(["Infiltrating Ductal Carcinoma", "Infiltrating Lobular Carcinoma", "Mixed Histology"]),
  margin_status: z.enum(["Negative", "Positive", "Close"]),
  lymph_nodes_examined: z.number().min(0, "Must be 0 or greater"),
})

type PatientFormData = z.infer<typeof patientSchema>

// 2. Updated Logical Steps for Clinical Workflow
const steps = [
  { id: 1, title: "Demographics", icon: User },
  { id: 2, title: "Clinical History", icon: History },
  { id: 3, title: "Receptor Status", icon: Dna },
  { id: 4, title: "Tumor Details", icon: Activity },
  { id: 5, title: "Surgical & Nodes", icon: Stethoscope },
]

interface PatientIntakeProps {
  onComplete?: (data: any) => void
}

export function PatientIntake({ onComplete }: PatientIntakeProps) {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      diagnosis_age: 50,
      race_category: "WHITE",
      menopause_status: "Post",
      prior_cancer: "No",
      er_status: "Positive",
      pr_status: "Positive",
      her2_status: "Negative",
      tumor_stage: "Stage IIA",
      histology_type: "Infiltrating Ductal Carcinoma",
      margin_status: "Negative",
      lymph_nodes_examined: 0,
    },
  })

  const progress = (currentStep / steps.length) * 100

  const nextStep = async () => {
    // Validate current step before moving forward
    let fieldsToValidate: any[] = []
    if (currentStep === 1) fieldsToValidate = ["firstName", "lastName", "diagnosis_age", "race_category"]
    if (currentStep === 2) fieldsToValidate = ["menopause_status", "prior_cancer"]
    if (currentStep === 3) fieldsToValidate = ["er_status", "pr_status", "her2_status"]
    if (currentStep === 4) fieldsToValidate = ["tumor_stage", "histology_type"]
    if (currentStep === 5) fieldsToValidate = ["margin_status", "lymph_nodes_examined"]

    const isValid = await form.trigger(fieldsToValidate)
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true)
    try {
      console.log("🚀 Sending TCGA dataset to Python...", data)

      // Map perfectly to the new Flask API payload
      const payload = {
        name: `${data.firstName} ${data.lastName}`, // Combine names for DB
        diagnosis_age: data.diagnosis_age,
        race_category: data.race_category,
        menopause_status: data.menopause_status,
        prior_cancer: data.prior_cancer,
        er_status: data.er_status,
        pr_status: data.pr_status,
        her2_status: data.her2_status,
        tumor_stage: data.tumor_stage,
        histology_type: data.histology_type,
        margin_status: data.margin_status,
        lymph_nodes_examined: data.lymph_nodes_examined
      }

      const response = await fetch("http://127.0.0.1:5000/predict_risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to connect to server")
      }

      const result = await response.json()
      
      alert(`Assessment Complete!\n\nRisk Level: ${result.risk_score}\nModel Confidence: ${result.risk_probability}%`)
      
      if (onComplete) {
        onComplete({ ...data, ...result })
      }

    } catch (error) {
      console.error("❌ Submission Error:", error)
      alert("Error: Could not connect to Python Backend.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Progress Header */}
      <Card className="border-border/50 bg-card/50 shadow-lg shadow-black/5">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Comprehensive Risk Assessment
              </h2>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-2 bg-secondary" />
          
          <div className="mt-6 flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center gap-2",
                  currentStep >= step.id
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    currentStep > step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className="hidden text-xs font-medium sm:block">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="border-border/50 bg-card/50 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {React.createElement(steps[currentStep - 1].icon, {
                  className: "h-5 w-5 text-primary",
                })}
                {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* STEP 1: Demographics */}
              {currentStep === 1 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl><Input placeholder="Enter first name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl><Input placeholder="Enter last name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="diagnosis_age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnosis Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={18}
                            max={120}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="race_category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Race Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="WHITE">White</SelectItem>
                            <SelectItem value="BLACK OR AFRICAN AMERICAN">Black / African American</SelectItem>
                            <SelectItem value="ASIAN">Asian</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* STEP 2: Clinical History */}
              {currentStep === 2 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="menopause_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Menopause Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Pre">Pre-menopausal</SelectItem>
                            <SelectItem value="Peri">Peri-menopausal</SelectItem>
                            <SelectItem value="Post">Post-menopausal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prior_cancer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prior Cancer Diagnosis?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* STEP 3: Receptor Status (ER/PR/HER2) */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="er_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ER Status (Estrogen Receptor)</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                            {["Positive", "Negative"].map((val) => (
                              <div key={`er-${val}`}>
                                <RadioGroupItem value={val} id={`er-${val}`} className="peer sr-only" />
                                <Label htmlFor={`er-${val}`} className="flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 hover:bg-secondary peer-data-[state=checked]:border-primary">{val}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pr_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PR Status (Progesterone Receptor)</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                            {["Positive", "Negative"].map((val) => (
                              <div key={`pr-${val}`}>
                                <RadioGroupItem value={val} id={`pr-${val}`} className="peer sr-only" />
                                <Label htmlFor={`pr-${val}`} className="flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 hover:bg-secondary peer-data-[state=checked]:border-primary">{val}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="her2_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HER2 Status</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                            {["Positive", "Negative"].map((val) => (
                              <div key={`her2-${val}`}>
                                <RadioGroupItem value={val} id={`her2-${val}`} className="peer sr-only" />
                                <Label htmlFor={`her2-${val}`} className="flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 hover:bg-secondary peer-data-[state=checked]:border-primary">{val}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* STEP 4: Tumor Details */}
              {currentStep === 4 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="tumor_stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tumor Stage (AJCC)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select Stage" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Stage I">Stage I</SelectItem>
                            <SelectItem value="Stage IIA">Stage IIA</SelectItem>
                            <SelectItem value="Stage IIB">Stage IIB</SelectItem>
                            <SelectItem value="Stage IIIA">Stage IIIA</SelectItem>
                            <SelectItem value="Stage IV">Stage IV</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="histology_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Histologic Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Infiltrating Ductal Carcinoma">Infiltrating Ductal Carcinoma</SelectItem>
                            <SelectItem value="Infiltrating Lobular Carcinoma">Infiltrating Lobular Carcinoma</SelectItem>
                            <SelectItem value="Mixed Histology">Mixed Histology</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* STEP 5: Surgical & Nodes */}
              {currentStep === 5 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="margin_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Surgical Margin Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select Margin" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Negative">Negative (Clear)</SelectItem>
                            <SelectItem value="Close">Close</SelectItem>
                            <SelectItem value="Positive">Positive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lymph_nodes_examined"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lymph Nodes Examined (Number)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-6">
            <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            
            {currentStep === steps.length ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Generating AI Score..." : <>Complete & Analyze <Check className="ml-2 h-4 w-4" /></>}
              </Button>
            ) : (
              <Button type="button" onClick={nextStep}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}