"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Globe,
  Users,
  Target,
  Zap,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  MapPin,
  Heart,
  Star,
  ArrowRight,
  Sparkles,
  Award,
  Calendar,
  Activity,
  BarChart3,
  MessageSquare,
  Shield,
  Building2,
  Lightbulb,
  Rocket,
} from "lucide-react"
import { supabase, type Database } from "@/lib/supabase"

type Complaint = Database["public"]["Tables"]["complaints"]["Row"]

interface WelcomeDashboardProps {
  onNavigateToTab: (tab: string) => void
}

function getStatusColor(status: string) {
  switch (status) {
    case "Pending":
      return "bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-800 border-amber-200"
    case "In Progress":
      return "bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-800 border-blue-200"
    case "Resolved":
      return "bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-800 border-emerald-200"
    default:
      return "bg-gradient-to-r from-gray-50 to-slate-100 text-gray-800 border-gray-200"
  }
}

export function WelcomeDashboard({ onNavigateToTab }: WelcomeDashboardProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setComplaints(data || [])
    } catch (error) {
      console.error("Error fetching complaints:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalComplaints = complaints.length
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length
  const pendingCount = complaints.filter((c) => c.status === "Pending").length
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0
  const recentComplaints = complaints.slice(0, 3)

  const quickActions = [
    {
      title: "Report New Issue",
      description: "Submit a new complaint about civic issues in your community",
      icon: Sparkles,
      color: "from-blue-500 to-purple-600",
      action: () => onNavigateToTab("report"),
    },
    {
      title: "Track Complaints",
      description: "Search and monitor existing complaints and their progress",
      icon: Activity,
      color: "from-emerald-500 to-teal-600",
      action: () => onNavigateToTab("track"),
    },
    {
      title: "View Analytics",
      description: "Explore community statistics and resolution performance",
      icon: BarChart3,
      color: "from-purple-500 to-pink-600",
      action: () => onNavigateToTab("dashboard"),
    },
  ]

  const features = [
    {
      icon: Globe,
      title: "Smart Reporting",
      description: "AI-powered categorization and location detection for faster resolution",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Upvote important issues and collaborate with fellow citizens",
    },
    {
      icon: Shield,
      title: "Government Integration",
      description: "Direct connection with relevant departments for efficient handling",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications about your complaint status changes",
    },
  ]

  const achievements = [
    {
      icon: Award,
      title: "Community Champion",
      description: `${totalComplaints} total issues reported by citizens`,
      value: totalComplaints,
      color: "text-blue-600",
    },
    {
      icon: CheckCircle,
      title: "Resolution Success",
      description: `${resolutionRate}% of issues successfully resolved`,
      value: `${resolutionRate}%`,
      color: "text-green-600",
    },
    {
      icon: Heart,
      title: "Community Support",
      description: `${complaints.reduce((sum, c) => sum + c.upvotes, 0)} total community votes`,
      value: complaints.reduce((sum, c) => sum + c.upvotes, 0),
      color: "text-pink-600",
    },
  ]

  return (
    <div className="space-y-12">
      {/* Hero Welcome Section */}
      <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white border-0 shadow-2xl rounded-3xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
        <CardContent className="p-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Rocket className="h-8 w-8" />
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-bold">
                    Welcome to the Future of Civic Engagement
                  </Badge>
                </div>
                <h1 className="text-5xl font-black leading-tight">
                  Transform Your Community
                  <br />
                  <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    One Report at a Time
                  </span>
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
                  Join thousands of citizens making a real difference. Report issues, track progress, and build a better future together through the power of technology and community collaboration.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => onNavigateToTab("report")}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Sparkles className="mr-3 h-6 w-6" />
                  Report Your First Issue
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
                <Button
                  onClick={() => onNavigateToTab("track")}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Activity className="mr-3 h-6 w-6" />
                  Explore Issues
                </Button>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="h-8 w-8 text-green-300" />
                      <span className="text-2xl font-bold">{resolvedCount}</span>
                    </div>
                    <p className="text-blue-100">Issues Resolved</p>
                  </div>
                  <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="h-8 w-8 text-blue-300" />
                      <span className="text-2xl font-bold">{totalComplaints}</span>
                    </div>
                    <p className="text-blue-100">Community Reports</p>
                  </div>
                </div>
                <div className="space-y-6 mt-8">
                  <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="h-8 w-8 text-yellow-300" />
                      <span className="text-2xl font-bold">{resolutionRate}%</span>
                    </div>
                    <p className="text-blue-100">Success Rate</p>
                  </div>
                  <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="h-8 w-8 text-orange-300" />
                      <span className="text-2xl font-bold">{inProgressCount}</span>
                    </div>
                    <p className="text-blue-100">In Progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Floating decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full"></div>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Quick Actions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started with these essential features to make an immediate impact in your community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="backdrop-blur-sm bg-white/90 border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer group"
              onClick={action.action}
            >
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-gray-800">{action.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{action.description}</p>
                  </div>
                  <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-xl py-3 font-semibold group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Platform Features */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the next generation of civic engagement with cutting-edge features designed for maximum impact
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="backdrop-blur-sm bg-white/90 border-0 shadow-lg rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Community Achievements */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Community Impact
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Together, we're making a real difference in our communities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {achievements.map((achievement, index) => (
            <Card
              key={index}
              className="backdrop-blur-sm bg-white/90 border-0 shadow-xl rounded-3xl overflow-hidden"
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-gray-100 rounded-2xl">
                    <achievement.icon className={`h-10 w-10 ${achievement.color}`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-800">{achievement.title}</h3>
                    <p className="text-gray-600">{achievement.description}</p>
                    <p className={`text-3xl font-bold ${achievement.color}`}>{achievement.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {!loading && recentComplaints.length > 0 && (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Recent Community Activity
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what your fellow citizens are working on
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentComplaints.map((complaint) => (
              <Card
                key={complaint.id}
                className="backdrop-blur-sm bg-white/90 border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <Badge className={`${getStatusColor(complaint.status)} px-3 py-1 text-sm font-bold rounded-full`}>
                        {complaint.status}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Heart className="h-4 w-4 text-pink-500" />
                        <span className="font-semibold">{complaint.upvotes}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-gray-800 line-clamp-2">{complaint.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3">{complaint.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{complaint.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{complaint.date_submitted}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => onNavigateToTab("track")}
              variant="outline"
              className="px-8 py-4 text-lg font-semibold rounded-2xl border-2 hover:bg-gray-50 transition-all duration-300"
            >
              View All Issues
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <Card className="backdrop-blur-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 shadow-2xl rounded-3xl overflow-hidden relative">
        <CardContent className="p-12 text-center relative z-10">
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Lightbulb className="h-12 w-12" />
                </div>
              </div>
              <h2 className="text-4xl font-bold">Ready to Make a Difference?</h2>
              <p className="text-xl text-emerald-100 leading-relaxed">
                Your voice matters. Join our community of engaged citizens and help build a better tomorrow for everyone.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => onNavigateToTab("report")}
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Sparkles className="mr-3 h-6 w-6" />
                Submit Your First Report
              </Button>
              <Button
                onClick={() => onNavigateToTab("dashboard")}
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <BarChart3 className="mr-3 h-6 w-6" />
                Explore Analytics
              </Button>
            </div>
          </div>
        </CardContent>

        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      </Card>
    </div>
  )
}