"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  User,
  MapPin,
  Heart,
  Wallet,
  FileCheck,
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
import { Checkbox } from "@/components/ui/checkbox"
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

const patientSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  age: z.number().min(18, "Patient must be at least 18 years old").max(120),
  parity: z.enum(["0", "1-2", "3-4", "5+"]),
  familyHistory: z.boolean(),
  personalHistory: z.boolean(),
  comorbidities: z.array(z.string()),
  educationLevel: z.enum(["none", "primary", "secondary", "tertiary"]),
  employmentStatus: z.enum(["employed", "unemployed", "retired", "informal"]),
  insuranceStatus: z.enum(["none", "public", "private"]),
  location: z.string().min(1, "Location is required"),
  distanceToClinic: z.enum(["0-10", "11-30", "31-50", "50+"]),
  transportAccess: z.enum(["own", "public", "limited", "none"]),
  clinicalNotes: z.string().optional(),
})

type PatientFormData = z.infer<typeof patientSchema>

const steps = [
  { id: 1, title: "Demographics", icon: User },
  { id: 2, title: "Clinical History", icon: Heart },
  { id: 3, title: "Comorbidities", icon: FileCheck },
  { id: 4, title: "Socio-Economic", icon: Wallet },
  { id: 5, title: "Location", icon: MapPin },
]

const comorbidityOptions = [
  { id: "diabetes", label: "Diabetes Mellitus" },
  { id: "hypertension", label: "Hypertension" },
  { id: "obesity", label: "Obesity (BMI > 30)" },
  { id: "hrt", label: "Hormone Replacement Therapy" },
  { id: "smoking", label: "Current/Former Smoker" },
  { id: "alcohol", label: "Heavy Alcohol Use" },
  { id: "radiation", label: "Previous Chest Radiation" },
  { id: "autoimmune", label: "Autoimmune Disorders" },
]

// FIX: Made onComplete optional with '?' so we don't HAVE to pass a function
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
      dateOfBirth: "",
      age: 40,
      parity: "0",
      familyHistory: false,
      personalHistory: false,
      comorbidities: [],
      educationLevel: "primary",
      employmentStatus: "employed",
      insuranceStatus: "none",
      location: "",
      distanceToClinic: "0-10",
      transportAccess: "public",
      clinicalNotes: "",
    },
  })

  const progress = (currentStep / steps.length) * 100

  const nextStep = () => {
    if (currentStep < steps.length) {
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
      console.log("🚀 Sending FULL dataset to Python...", data)

      const payload = {
        age: data.age,
        firstName: data.firstName,
        lastName: data.lastName,
        parity: data.parity === "5+" ? 5 : parseInt(data.parity.split("-")[0]),
        history: data.familyHistory || data.personalHistory,
        comorbidities: data.comorbidities,
        educationLevel: data.educationLevel,
        employmentStatus: data.employmentStatus,
        insuranceStatus: data.insuranceStatus,
        location: data.location.includes("rural") ? "Rural" : "Urban",
        distanceToClinic: data.distanceToClinic,
        transportAccess: data.transportAccess
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
      
      alert(`Assessment Complete!\n\nRisk Score: ${result.risk_score}%\nRisk Level: ${result.risk_level}`)
      
      // FIX: Only run this if the function exists
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
                New Patient Intake
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
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age (years)</FormLabel>
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
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="parity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Pregnancies</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-4 gap-4"
                          >
                             {["0", "1-2", "3-4", "5+"].map((val) => (
                              <div key={val}>
                                <RadioGroupItem value={val} id={`parity-${val}`} className="peer sr-only" />
                                <Label htmlFor={`parity-${val}`} className="flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 hover:bg-secondary peer-data-[state=checked]:border-primary">
                                  {val}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="familyHistory"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 p-4 border rounded-lg">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <div className="space-y-1 leading-none"><FormLabel>Family History</FormLabel></div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalHistory"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 p-4 border rounded-lg">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <div className="space-y-1 leading-none"><FormLabel>Personal History</FormLabel></div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="comorbidities"
                    render={() => (
                      <FormItem>
                        <FormLabel>Comorbidities</FormLabel>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {comorbidityOptions.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="comorbidities"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 p-4 border rounded-lg">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(field.value?.filter((value) => value !== item.id))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="educationLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="tertiary">Tertiary</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employmentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="employed">Employed</SelectItem>
                            <SelectItem value="informal">Informal</SelectItem>
                            <SelectItem value="unemployed">Unemployed</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="insuranceStatus"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Insurance</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-4">
                            {["none", "public", "private"].map((val) => (
                              <div key={val}>
                                <RadioGroupItem value={val} id={`ins-${val}`} className="peer sr-only" />
                                <Label htmlFor={`ins-${val}`} className="flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 hover:bg-secondary peer-data-[state=checked]:border-primary capitalize">{val}</Label>
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

              {currentStep === 5 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="rural-a">Rural Clinic A</SelectItem>
                            <SelectItem value="urban">Urban Health Center</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="distanceToClinic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distance (km)</FormLabel>
                        <FormControl>
                           <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-4 gap-4">
                            {["0-10", "11-30", "31-50", "50+"].map((val) => (
                              <div key={val}>
                                <RadioGroupItem value={val} id={`dist-${val}`} className="peer sr-only" />
                                <Label htmlFor={`dist-${val}`} className="flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 hover:bg-secondary peer-data-[state=checked]:border-primary">{val}</Label>
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
                    name="transportAccess"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transport</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="own">Own Vehicle</SelectItem>
                            <SelectItem value="public">Public Transport</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
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
                {isSubmitting ? "Analyzing..." : <>Complete <Check className="ml-2 h-4 w-4" /></>}
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