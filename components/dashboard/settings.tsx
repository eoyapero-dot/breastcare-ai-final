"use client"

import * as React from "react"
import { User, Lock, Bell, Shield, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Settings() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    first_name: "", last_name: "", email: "", bio: "",
    notify_email: true, notify_sms: false,
    high_sensitivity: false, auto_retrain: true
  })

  // 1. LOAD DATA
  React.useEffect(() => {
    fetch("http://127.0.0.1:5000/settings")
      .then(res => res.json())
      .then(data => {
        if (!data.error) setFormData(data)
      })
      .catch(err => console.error("Failed to load settings", err))
  }, [])

  // 2. INPUT HANDLERS
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleToggle = (key: string, val: boolean) => {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  // 3. SAVE HANDLER
  const handleSave = async (section: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:5000/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) alert(`✅ ${section} settings saved to database!`)
      else alert("❌ Failed to save.")
    } catch (e) {
      alert("Error connecting to server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>
      <Separator className="my-6" />
      
      <Tabs defaultValue="profile" className="space-y-6">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <TabsList className="flex flex-col h-auto items-stretch bg-transparent space-y-2">
              <TabsTrigger value="profile" className="justify-start px-4 py-2 data-[state=active]:bg-muted data-[state=active]:text-primary"><User className="mr-2 h-4 w-4" /> Profile</TabsTrigger>
              <TabsTrigger value="notifications" className="justify-start px-4 py-2 data-[state=active]:bg-muted data-[state=active]:text-primary"><Bell className="mr-2 h-4 w-4" /> Notifications</TabsTrigger>
              <TabsTrigger value="system" className="justify-start px-4 py-2 data-[state=active]:bg-muted data-[state=active]:text-primary"><Shield className="mr-2 h-4 w-4" /> System</TabsTrigger>
              <TabsTrigger value="account" className="justify-start px-4 py-2 data-[state=active]:bg-muted data-[state=active]:text-primary"><Lock className="mr-2 h-4 w-4" /> Security</TabsTrigger>
            </TabsList>
          </aside>

          <div className="flex-1 lg:max-w-2xl">
            
            {/* PROFILE TAB */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Public Profile</CardTitle><CardDescription>This is how others will see you.</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24"><AvatarImage src="/avatars/01.png" /><AvatarFallback className="text-xl">DR</AvatarFallback></Avatar>
                    <Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" /> Change Avatar</Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="first_name">First name</Label><Input id="first_name" value={formData.first_name} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="last_name">Last name</Label><Input id="last_name" value={formData.last_name} onChange={handleInputChange} /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" value={formData.email} onChange={handleInputChange} /></div>
                  <div className="space-y-2"><Label htmlFor="bio">Bio</Label><textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" id="bio" value={formData.bio || ""} onChange={handleInputChange} /></div>
                </CardContent>
                <CardFooter><Button onClick={() => handleSave("Profile")} disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Profile</Button></CardFooter>
              </Card>
            </TabsContent>

            {/* NOTIFICATIONS TAB */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Alert Preferences</CardTitle><CardDescription>Manage how you receive alerts.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5"><Label className="text-base">Email Alerts</Label><p className="text-sm text-muted-foreground">Receive high-risk alerts.</p></div>
                    <Switch checked={formData.notify_email} onCheckedChange={(v) => handleToggle('notify_email', v)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5"><Label className="text-base">SMS Notifications</Label><p className="text-sm text-muted-foreground">Receive updates on phone.</p></div>
                    <Switch checked={formData.notify_sms} onCheckedChange={(v) => handleToggle('notify_sms', v)} />
                  </div>
                </CardContent>
                <CardFooter><Button onClick={() => handleSave("Notification")} disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Preferences</Button></CardFooter>
              </Card>
            </TabsContent>

             {/* SYSTEM TAB */}
             <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader><CardTitle>AI Configuration</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5"><Label>High Sensitivity Mode</Label><p className="text-sm text-muted-foreground">Increase detection rate.</p></div>
                    <Switch checked={formData.high_sensitivity} onCheckedChange={(v) => handleToggle('high_sensitivity', v)} />
                  </div>
                   <div className="flex items-center justify-between">
                    <div className="space-y-0.5"><Label>Auto-Retrain</Label><p className="text-sm text-muted-foreground">Auto update model.</p></div>
                    <Switch checked={formData.auto_retrain} onCheckedChange={(v) => handleToggle('auto_retrain', v)} />
                  </div>
                </CardContent>
                <CardFooter><Button onClick={() => handleSave("System")} disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Configuration</Button></CardFooter>
              </Card>
            </TabsContent>

            {/* SECURITY TAB */}
            <TabsContent value="account" className="space-y-6">
               <Card>
                 <CardHeader><CardTitle>Password</CardTitle><CardDescription>Security settings.</CardDescription></CardHeader>
                 <CardContent><div className="space-y-2"><Label>New Password</Label><Input type="password" /></div></CardContent>
                 <CardFooter><Button onClick={() => alert("Password reset simulation complete.")}>Update Password</Button></CardFooter>
               </Card>
            </TabsContent>

          </div>
        </div>
      </Tabs>
    </div>
  )
}