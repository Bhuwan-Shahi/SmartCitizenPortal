"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Lock, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AdminLoginProps {
  onLogin: (isAdmin: boolean) => void
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simple demo authentication - in production, use proper auth
    if (credentials.email === "admin@city.gov" && credentials.password === "admin123") {
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard!",
      })
      onLogin(true)
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Try admin@city.gov / admin123",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl translate-x-48 translate-y-48"></div>
      </div>
      
      <Card className="w-full max-w-lg backdrop-blur-sm bg-white/90 border-0 shadow-2xl rounded-3xl overflow-hidden relative z-10">
        <CardHeader className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white rounded-t-3xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="mx-auto w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <Shield className="h-10 w-10" />
            </div>
            <CardTitle className="text-3xl font-bold">Admin Access</CardTitle>
            <CardDescription className="text-blue-100 text-lg mt-3">Sign in to access the government dashboard</CardDescription>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        </CardHeader>
        <CardContent className="p-10">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-4">
              <Label htmlFor="email" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Email Address
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-5 h-6 w-6 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@city.gov"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="pl-14 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 rounded-xl bg-gray-50/50 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="password" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
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
                  className="pl-14 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 rounded-xl bg-gray-50/50 focus:bg-white"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-500 shadow-2xl hover:shadow-blue-500/25 rounded-2xl transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Access Admin Dashboard"
              )}
            </Button>
          </form>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
            <p className="text-lg text-blue-800 font-bold mb-3">Demo Credentials:</p>
            <div className="space-y-2">
              <p className="text-sm text-blue-700 font-semibold bg-white/60 px-3 py-2 rounded-lg">Email: admin@city.gov</p>
              <p className="text-sm text-blue-700 font-semibold bg-white/60 px-3 py-2 rounded-lg">Password: admin123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
