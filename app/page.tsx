"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  MapPin,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  ThumbsUp,
  BarChart3,
  PieChart,
  Activity,
  Navigation,
  Loader2,
  Zap,
  Users,
  Target,
  Globe,
  Shield,
  Building2,
  Sparkles,
  ArrowRight,
  Star,
  Heart,
  MessageSquare,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { supabase, type Database } from "@/lib/supabase"
import { useGeolocation } from "@/hooks/use-geolocation"
import { reverseGeocode, calculateDistance } from "@/lib/geocoding"
import { SimpleMap } from "@/components/simple-map"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminLogin } from "@/components/auth/admin-login"
import { DepartmentDashboard } from "@/components/department/department-dashboard"
import { DepartmentLogin } from "@/components/auth/department-login"

type Complaint = Database["public"]["Tables"]["complaints"]["Row"]

const categories = [
  "Roads",
  "Utilities",
  "Sanitation",
  "Public Safety",
  "Water Supply",
  "Public Transport",
  "Parks",
  "Other",
]

const priorities = ["Low", "Medium", "High"]
const statuses = ["Pending", "In Progress", "Resolved"]

function getStatusColor(status: string) {
  switch (status) {
    case "Pending":
      return "bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-800 border-amber-200 shadow-sm"
    case "In Progress":
      return "bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-800 border-blue-200 shadow-sm"
    case "Resolved":
      return "bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-800 border-emerald-200 shadow-sm"
    default:
      return "bg-gradient-to-r from-gray-50 to-slate-100 text-gray-800 border-gray-200 shadow-sm"
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "Low":
      return "bg-gradient-to-r from-gray-50 to-slate-100 text-gray-700 border-gray-200 shadow-sm"
    case "Medium":
      return "bg-gradient-to-r from-orange-50 to-amber-100 text-orange-700 border-orange-200 shadow-sm"
    case "High":
      return "bg-gradient-to-r from-red-50 to-rose-100 text-red-700 border-red-200 shadow-sm"
    default:
      return "bg-gradient-to-r from-gray-50 to-slate-100 text-gray-700 border-gray-200 shadow-sm"
  }
}

function ReportIssueForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Medium",
    location: "",
    photos: null as File[] | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { latitude, longitude, error, loading, getCurrentLocation } = useGeolocation()
  const [isGettingAddress, setIsGettingAddress] = useState(false)

  const handleGetLocation = async () => {
    getCurrentLocation()
  }

  useEffect(() => {
    if (latitude && longitude) {
      setIsGettingAddress(true)
      reverseGeocode(latitude, longitude)
        .then((address) => {
          setFormData((prev) => ({ ...prev, location: address }))
        })
        .catch((error) => {
          console.error("Failed to get address:", error)
          setFormData((prev) => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }))
        })
        .finally(() => {
          setIsGettingAddress(false)
        })
    }
  }, [latitude, longitude])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from("complaints")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            priority: formData.priority,
            location: formData.location,
            latitude: latitude,
            longitude: longitude,
          },
        ])
        .select()

      if (error) throw error

      toast({
        title: "🎉 Complaint Submitted Successfully!",
        description: `Your complaint "${formData.title}" has been submitted and will be reviewed shortly.`,
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "Medium",
        location: "",
        photos: null,
      })
    } catch (error) {
      console.error("Error submitting complaint:", error)
      toast({
        title: "Error",
        description: "Failed to submit complaint. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl shadow-blue-500/10 rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <CardTitle className="flex items-center gap-4 text-3xl font-bold">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Sparkles className="h-8 w-8" />
            </div>
            Report New Issue
          </CardTitle>
          <CardDescription className="text-blue-100 text-lg mt-2">
            Help improve your community by reporting civic issues
          </CardDescription>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      </CardHeader>
      <CardContent className="p-10">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-4">
            <Label htmlFor="title" className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Issue Title *
            </Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="h-14 text-lg border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 rounded-xl bg-gray-50/50 focus:bg-white"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="description" className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Detailed Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about the issue"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              required
              className="text-lg border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 resize-none rounded-xl bg-gray-50/50 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label htmlFor="category" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-gray-50/50 focus:bg-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-lg py-3">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                Priority Level
              </Label>
              <RadioGroup
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                className="flex gap-6"
              >
                {priorities.map((priority) => (
                  <div key={priority} className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                    <RadioGroupItem value={priority} id={priority} className="w-6 h-6" />
                    <Label htmlFor={priority} className="text-lg font-semibold cursor-pointer">
                      {priority}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="location" className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Location/Address *
            </Label>
            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-5 h-6 w-6 text-gray-400" />
                <Input
                  id="location"
                  placeholder="Enter the location of the issue"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-14 text-lg pl-14 border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 rounded-xl bg-gray-50/50 focus:bg-white"
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGetLocation}
                disabled={loading || isGettingAddress}
                className="w-full h-14 text-lg border-2 border-blue-200 hover:bg-blue-50 transition-all duration-300 bg-transparent rounded-xl font-semibold"
              >
                {loading || isGettingAddress ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    {loading ? "Getting Location..." : "Getting Address..."}
                  </>
                ) : (
                  <>
                    <Navigation className="mr-3 h-6 w-6" />
                    Use Current Location
                  </>
                )}
              </Button>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {latitude && longitude && (
            <div className="space-y-4">
              <Label className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Location Preview
              </Label>
              <SimpleMap latitude={latitude} longitude={longitude} className="h-64 border-2 border-gray-200 rounded-xl" />
            </div>
          )}

          <div className="space-y-4">
            <Label htmlFor="photos" className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload Photos (Optional)
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 transition-all duration-300 bg-gradient-to-br from-gray-50/50 to-blue-50/30 hover:from-blue-50/50 hover:to-purple-50/30">
              <Upload className="mx-auto h-20 w-20 text-gray-400 mb-6" />
              <div className="space-y-3">
                <Label htmlFor="photos" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500 text-xl font-bold">Click to upload</span>
                  <span className="text-gray-500 text-xl"> or drag and drop</span>
                </Label>
                <Input
                  id="photos"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setFormData({ ...formData, photos: e.target.files ? Array.from(e.target.files) : null })
                  }
                />
              </div>
              <p className="text-sm text-gray-500 mt-4">PNG, JPG, GIF up to 10MB each</p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-500 shadow-2xl hover:shadow-blue-500/25 rounded-2xl transform hover:scale-[1.02]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-3 h-7 w-7 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Zap className="mr-3 h-7 w-7" />
                Submit Complaint
                <ArrowRight className="ml-3 h-7 w-7" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function TrackComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const { latitude, longitude } = useGeolocation()

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
      toast({
        title: "Error",
        description: "Failed to load complaints. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = async (complaintId: string, currentUpvotes: number) => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ upvotes: currentUpvotes + 1 })
        .eq("id", complaintId)

      if (error) throw error

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === complaintId ? { ...complaint, upvotes: currentUpvotes + 1 } : complaint,
        ),
      )

      toast({
        title: "Upvoted!",
        description: "Thank you for supporting this issue.",
      })
    } catch (error) {
      console.error("Error upvoting:", error)
      toast({
        title: "Error",
        description: "Failed to upvote. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || complaint.category === filterCategory
    const matchesStatus = filterStatus === "all" || complaint.status === filterStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Calculate distances if user location is available
  const complaintsWithDistance = filteredComplaints.map((complaint) => ({
    ...complaint,
    distance:
      latitude && longitude && complaint.latitude && complaint.longitude
        ? calculateDistance(latitude, longitude, complaint.latitude, complaint.longitude)
        : null,
  }))

  if (loading) {
    return (
      <div className="space-y-8">
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl rounded-3xl">
          <CardContent className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl rounded-3xl">
              <CardContent className="p-10">
                <Skeleton className="h-40 w-full rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <CardTitle className="flex items-center gap-4 text-3xl font-bold">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Search className="h-8 w-8" />
              </div>
              Search & Filter Complaints
            </CardTitle>
            <CardDescription className="text-emerald-100 text-lg mt-2">
              Find and track community issues
            </CardDescription>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        </CardHeader>
        <CardContent className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Label htmlFor="search" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Search className="h-5 w-5 text-emerald-600" />
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-4 top-5 h-6 w-6 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-14 text-lg pl-14 border-2 border-gray-200 focus:border-emerald-500 transition-all duration-300 rounded-xl bg-gray-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="category-filter" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-600" />
                Category
              </Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl bg-gray-50/50 focus:bg-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label htmlFor="status-filter" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                Status
              </Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl bg-gray-50/50 focus:bg-white">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8">
        {complaintsWithDistance.map((complaint) => (
          <Card
            key={complaint.id}
            className="hover:shadow-2xl transition-all duration-500 border-0 shadow-lg backdrop-blur-sm bg-white/90 rounded-3xl transform hover:scale-[1.02] hover:shadow-blue-500/10"
          >
            <CardContent className="p-10">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <h3 className="font-bold text-2xl text-gray-900">{complaint.title}</h3>
                      <p className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full inline-block">
                        ID: {complaint.id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Badge className={`${getPriorityColor(complaint.priority)} px-4 py-2 text-sm font-bold rounded-full`}>
                        {complaint.priority}
                      </Badge>
                      <Badge className={`${getStatusColor(complaint.status)} px-4 py-2 text-sm font-bold rounded-full`}>
                        {complaint.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-700 text-lg leading-relaxed bg-gray-50 p-6 rounded-2xl">{complaint.description}</p>

                  <div className="flex flex-wrap gap-8 text-sm text-gray-600">
                    <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">{complaint.location}</span>
                      {complaint.distance && (
                        <span className="text-blue-600 font-bold">({complaint.distance.toFixed(1)} km away)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-full">
                      <Calendar className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">{complaint.date_submitted}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-sm font-bold border-2 px-4 py-2 rounded-full">
                        {complaint.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-3 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 border-2 border-pink-200 hover:border-pink-300 transition-all duration-300 rounded-2xl px-6 py-4"
                    onClick={() => handleUpvote(complaint.id, complaint.upvotes)}
                  >
                    <Heart className="h-6 w-6 text-pink-500" />
                    <span className="font-bold text-lg">{complaint.upvotes}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 hover:bg-gray-50 transition-all duration-300 bg-transparent rounded-2xl px-6 py-4 font-semibold"
                  >
                    View Details
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {complaintsWithDistance.length === 0 && (
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl rounded-3xl">
          <CardContent className="p-16 text-center">
            <div className="space-y-6">
              <div className="mx-auto w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <Search className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700">No complaints found</h3>
              <p className="text-gray-500 text-lg">Try adjusting your search criteria or filters.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CommunityDashboard() {
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

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl rounded-3xl">
              <CardContent className="p-10">
                <Skeleton className="h-32 w-full rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const totalComplaints = complaints.length
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length
  const pendingCount = complaints.filter((c) => c.status === "Pending").length

  const categoryStats = categories
    .map((category) => ({
      category,
      count: complaints.filter((c) => c.category === category).length,
    }))
    .filter((stat) => stat.count > 0)
    .sort((a, b) => b.count - a.count)

  const recentIssues = complaints.slice(0, 5)
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0

  return (
    <div className="space-y-10">
      {/* Hero Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-2xl rounded-3xl overflow-hidden transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-8 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <p className="text-blue-100 font-semibold text-lg">Total Complaints</p>
                <p className="text-5xl font-bold">{totalComplaints}</p>
                <p className="text-blue-200 text-sm">Community Issues</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <FileText className="h-12 w-12" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-2xl rounded-3xl overflow-hidden transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-8 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <p className="text-emerald-100 font-semibold text-lg">Resolved</p>
                <p className="text-5xl font-bold">{resolvedCount}</p>
                <p className="text-emerald-200 text-sm">{resolutionRate}% Success Rate</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <CheckCircle className="h-12 w-12" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-2xl rounded-3xl overflow-hidden transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-8 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <p className="text-purple-100 font-semibold text-lg">In Progress</p>
                <p className="text-5xl font-bold">{inProgressCount}</p>
                <p className="text-purple-200 text-sm">Being Addressed</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Clock className="h-12 w-12" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-2xl rounded-3xl overflow-hidden transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-8 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <p className="text-orange-100 font-semibold text-lg">Pending</p>
                <p className="text-5xl font-bold">{pendingCount}</p>
                <p className="text-orange-200 text-sm">Awaiting Review</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <AlertTriangle className="h-12 w-12" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Category Breakdown */}
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <CardTitle className="flex items-center gap-4 text-2xl font-bold">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <PieChart className="h-7 w-7" />
                </div>
                Issues by Category
              </CardTitle>
              <CardDescription className="text-indigo-100 text-lg">Distribution of community complaints</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <div className="space-y-8">
              {categoryStats.map((stat, index) => (
                <div key={stat.category} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-700">{stat.category}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-full">
                        {Math.round((stat.count / totalComplaints) * 100)}%
                      </span>
                      <span className="text-xl font-bold text-gray-900 bg-blue-100 px-4 py-2 rounded-full min-w-[3rem] text-center">{stat.count}</span>
                    </div>
                  </div>
                  <Progress value={(stat.count / totalComplaints) * 100} className="h-4 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Issues */}
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <CardTitle className="flex items-center gap-4 text-2xl font-bold">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Activity className="h-7 w-7" />
                </div>
                Recent Community Issues
              </CardTitle>
              <CardDescription className="text-teal-100 text-lg">Latest reported problems</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <div className="space-y-8">
              {recentIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start gap-6 p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-200 transition-all duration-300 bg-gradient-to-r from-white to-gray-50 hover:shadow-lg"
                >
                  <div className="flex-1 space-y-3">
                    <h4 className="font-bold text-xl text-gray-900">{issue.title}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-full w-fit">
                      <MapPin className="h-4 w-4" />
                      {issue.location}
                    </p>
                    <div className="flex items-center gap-4">
                      <Badge className={`${getStatusColor(issue.status)} text-xs font-bold px-3 py-1 rounded-full`}>{issue.status}</Badge>
                      <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-full">{issue.date_submitted}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 bg-pink-50 px-4 py-2 rounded-full">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <span className="font-bold">{issue.upvotes}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resolution Performance */}
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <CardTitle className="flex items-center gap-4 text-3xl font-bold">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <TrendingUp className="h-8 w-8" />
              </div>
              Resolution Performance
            </CardTitle>
            <CardDescription className="text-emerald-100 text-xl">Community issue resolution tracking</CardDescription>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        </CardHeader>
        <CardContent className="p-10">
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-700">Overall Resolution Rate</span>
              <span className="text-6xl font-bold text-green-600">{resolutionRate}%</span>
            </div>

            <div className="space-y-6">
              <Progress value={resolutionRate} className="h-8 rounded-full" />
              <div className="grid grid-cols-3 gap-8 text-center">
                <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border-2 border-green-200 transform hover:scale-105 transition-all duration-300">
                  <p className="text-4xl font-bold text-green-600">{resolvedCount}</p>
                  <p className="text-green-700 font-bold text-lg mt-2">Resolved</p>
                </div>
                <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-blue-200 transform hover:scale-105 transition-all duration-300">
                  <p className="text-4xl font-bold text-blue-600">{inProgressCount}</p>
                  <p className="text-blue-700 font-bold text-lg mt-2">In Progress</p>
                </div>
                <div className="p-8 bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl border-2 border-yellow-200 transform hover:scale-105 transition-all duration-300">
                  <p className="text-4xl font-bold text-yellow-600">{pendingCount}</p>
                  <p className="text-yellow-700 font-bold text-lg mt-2">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SmartCitizenPortal() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDepartmentUser, setIsDepartmentUser] = useState(false)
  const [departmentId, setDepartmentId] = useState("")
  const [departmentName, setDepartmentName] = useState("")

  const handleDepartmentLogin = (deptId: string, deptName: string) => {
    setDepartmentId(deptId)
    setDepartmentName(deptName)
    setIsDepartmentUser(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl translate-x-48"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full blur-3xl translate-y-48"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-6 mb-8">
            <div className="p-6 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl shadow-blue-500/25 transform hover:scale-110 transition-all duration-300">
              <Globe className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
              Smart Citizen Portal
            </h1>
          </div>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
            Empowering communities through technology. Report issues, track progress, and build a better future
            together.
          </p>
          <div className="flex items-center justify-center gap-12 mt-12">
            <div className="flex items-center gap-3 text-gray-600 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg">
              <Users className="h-7 w-7 text-blue-500" />
              <span className="font-bold text-lg">Community Driven</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg">
              <Target className="h-7 w-7 text-green-500" />
              <span className="font-bold text-lg">Results Focused</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg">
              <Zap className="h-7 w-7 text-purple-500" />
              <span className="font-bold text-lg">Real-time Updates</span>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="report" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-16 h-20 bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl p-3">
            <TabsTrigger
              value="report"
              className="flex items-center gap-4 text-xl font-bold h-14 rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-500 data-[state=active]:shadow-lg"
            >
              <Sparkles className="h-6 w-6" />
              Report Issue
            </TabsTrigger>
            <TabsTrigger
              value="track"
              className="flex items-center gap-4 text-xl font-bold h-14 rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-500 data-[state=active]:shadow-lg"
            >
              <Search className="h-6 w-6" />
              Track Complaints
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-4 text-xl font-bold h-14 rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-500 data-[state=active]:shadow-lg"
            >
              <BarChart3 className="h-6 w-6" />
              Community Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="flex items-center gap-4 text-xl font-bold h-14 rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white transition-all duration-500 data-[state=active]:shadow-lg"
            >
              <Shield className="h-6 w-6" />
              Admin
            </TabsTrigger>
            <TabsTrigger
              value="department"
              className="flex items-center gap-4 text-xl font-bold h-14 rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-500 data-[state=active]:shadow-lg"
            >
              <Building2 className="h-6 w-6" />
              Department
            </TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="mt-10">
            <ReportIssueForm />
          </TabsContent>

          <TabsContent value="track" className="mt-10">
            <TrackComplaints />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-10">
            <CommunityDashboard />
          </TabsContent>

          <TabsContent value="admin" className="mt-10">
            {isAdmin ? (
              <div className="space-y-4">
                <AdminDashboard />
              </div>
            ) : (
              <AdminLogin onLogin={setIsAdmin} />
            )}
          </TabsContent>
          <TabsContent value="department" className="mt-10">
            {isDepartmentUser ? (
              <DepartmentDashboard departmentId={departmentId} departmentName={departmentName} />
            ) : (
              <DepartmentLogin onLogin={handleDepartmentLogin} />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}