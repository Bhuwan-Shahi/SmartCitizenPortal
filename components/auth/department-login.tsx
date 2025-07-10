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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Department Access</CardTitle>
          <CardDescription className="text-green-100">Sign in to your department dashboard</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="department" className="text-lg font-semibold">
                Department
              </Label>
              <Select
                disabled={loadingDepts}
                value={credentials.department}
                onValueChange={(value) => setCredentials({ ...credentials, department: value })}
              >
                <SelectTrigger className="h-12 text-lg border-2 focus:border-green-500">
                  <SelectValue placeholder={loadingDepts ? "Loading departments…" : "Select your department"} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg font-semibold">
                Email Address
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@city.gov"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="pl-10 h-12 text-lg border-2 focus:border-green-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="pl-10 h-12 text-lg border-2 focus:border-green-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-xl font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Access Department Dashboard"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-medium">Demo Credentials:</p>
            <p className="text-sm text-green-700">Email: Any valid email</p>
            <p className="text-sm text-green-700">Password: dept123</p>
            <p className="text-sm text-green-700">Select any department above</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { DepartmentLogin }
