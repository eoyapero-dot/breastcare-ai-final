"use client"

import * as React from "react"
import {
  LayoutDashboard,
  UserPlus,
  Activity,
  Scan,
  Users,
  Settings,
  ChevronRight,
  Bell,
  Search,
  Menu,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

type View =
  | "dashboard"
  | "patient-intake"
  | "risk-assessment"
  | "imaging-analysis"
  | "patient-registry"
  | "settings"

interface DashboardLayoutProps {
  children: React.ReactNode
  currentView: View
  onViewChange: (view: View) => void
  breadcrumbs: { label: string; href?: string }[]
  userRole: "Clinician" | "Admin"
}

const navigationItems = [
  {
    id: "dashboard" as View,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "patient-intake" as View,
    label: "New Patient Intake",
    icon: UserPlus,
  },
  {
    id: "risk-assessment" as View,
    label: "Risk Assessment",
    icon: Activity,
  },
  {
    id: "imaging-analysis" as View,
    label: "Imaging Analysis",
    icon: Scan,
  },
  {
    id: "patient-registry" as View,
    label: "Patient Registry",
    icon: Users,
  },
  {
    id: "settings" as View,
    label: "System Settings",
    icon: Settings,
  },
]

export function DashboardLayout({
  children,
  currentView,
  onViewChange,
  breadcrumbs,
  userRole,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-border/50">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-foreground">
                BreastCare AI
              </span>
              <span className="text-xs text-muted-foreground">
                Clinical Platform
              </span>
            </div>
          </div>
        </SidebarHeader>

        <Separator className="mx-4 w-auto bg-border/50" />

        <SidebarContent className="px-2 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.id)}
                      isActive={currentView === item.id}
                      tooltip={item.label}
                      className={cn(
                        "transition-all duration-200",
                        currentView === item.id &&
                          "bg-primary/10 text-primary hover:bg-primary/15"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                DR
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium">Dr. Sarah Chen</span>
              <span className="text-xs text-muted-foreground">Oncologist</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/50 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.label}>
                    {index > 0 && (
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                      </BreadcrumbSeparator>
                    )}
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage className="text-foreground font-medium">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href={crumb.href || "#"}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="w-64 bg-secondary/50 pl-9 border-border/50 focus:border-primary"
              />
            </div>

            <Badge
              variant={userRole === "Admin" ? "default" : "secondary"}
              className={cn(
                "font-medium",
                userRole === "Admin"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {userRole}
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-medical-danger text-[10px] font-medium text-white">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      DR
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
