"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Lock, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface DepartmentLoginProps {
  onLogin: (departmentId: string, departmentName: string) => void
}

const DepartmentLogin: React.FC<DepartmentLoginProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    department: "",
  })
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [loadingDepts, setLoadingDepts] = useState(true)

  useEffect(() => {
    async function fetchDepartments() {
      const { data, error } = await supabase.from("departments").select("id, name").order("name")
      if (!error) setDepartments(data ?? [])
      setLoadingDepts(false)
    }
    fetchDepartments()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simple demo authentication - in production, use proper auth
    if (credentials.email && credentials.password === "dept123" && credentials.department) {
      const selectedDept = departments.find((d) => d.id === credentials.department)
      if (selectedDept) {
        toast({
          title: "Login Successful",
          description: `Welcome to ${selectedDept.name} dashboard!`,
        })
        onLogin(selectedDept.id, selectedDept.name)
      }
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Use any email with password 'dept123'",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full blur-3xl translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl -translate-x-48 translate-y-48"></div>
      </div>
      
      <Card className="w-full max-w-lg backdrop-blur-sm bg-white/90 border-0 shadow-2xl rounded-3xl overflow-hidden relative z-10">
        <CardHeader className="bg-gradient-to-br from-green-600 via-teal-600 to-blue-600 text-white rounded-t-3xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="mx-auto w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <Building2 className="h-10 w-10" />
            </div>
            <CardTitle className="text-3xl font-bold">Department Access</CardTitle>
            <CardDescription className="text-green-100 text-lg mt-3">Sign in to your department dashboard</CardDescription>
          </div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 -translate-x-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 translate-x-12"></div>
        </CardHeader>
        <CardContent className="p-10">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-4">
              <Label htmlFor="department" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                Department
              </Label>
              <Select
                disabled={loadingDepts}
                value={credentials.department}
                onValueChange={(value) => setCredentials({ ...credentials, department: value })}
              >
                <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-green-500 transition-all duration-300 rounded-xl bg-gray-50/50 focus:bg-white">
                  <SelectValue placeholder={loadingDepts ? "Loading departments…" : "Select your department"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id} className="py-3">
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label htmlFor="email" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Email Address
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-5 h-6 w-6 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@city.gov"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="pl-14 h-14 text-lg border-2 border-gray-200 focus:border-green-500 transition-all duration-300 rounded-xl bg-gray-50/50 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="password" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-600" />
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-5 h-6 w-6 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="pl-14 h-14 text-lg border-2 border-gray-200 focus:border-green-500 transition-all duration-300 rounded-xl bg-gray-50/50 focus:bg-white"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 hover:from-green-700 hover:via-teal-700 hover:to-blue-700 transition-all duration-500 shadow-2xl hover:shadow-green-500/25 rounded-2xl transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Access Department Dashboard"
              )}
            </Button>
          </form>

          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border-2 border-green-200">
            <p className="text-lg text-green-800 font-bold mb-3">Demo Credentials:</p>
            <div className="space-y-2">
              <p className="text-sm text-green-700 font-semibold bg-white/60 px-3 py-2 rounded-lg">Email: Any valid email</p>
              <p className="text-sm text-green-700 font-semibold bg-white/60 px-3 py-2 rounded-lg">Password: dept123</p>
              <p className="text-sm text-green-700 font-semibold bg-white/60 px-3 py-2 rounded-lg">Select any department above</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { DepartmentLogin }
