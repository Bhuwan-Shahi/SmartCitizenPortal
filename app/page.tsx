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
      return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300"
    case "In Progress":
      return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300"
    case "Resolved":
      return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300"
    default:
      return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300"
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "Low":
      return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300"
    case "Medium":
      return "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300"
    case "High":
      return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300"
    default:
      return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300"
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
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-white/20 rounded-lg">
            <FileText className="h-6 w-6" />
          </div>
          Report New Issue
        </CardTitle>
        <CardDescription className="text-blue-100">
          Help improve your community by reporting civic issues
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-lg font-semibold text-gray-700">
              Issue Title *
            </Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="h-12 text-lg border-2 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-lg font-semibold text-gray-700">
              Detailed Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about the issue"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              required
              className="text-lg border-2 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="category" className="text-lg font-semibold text-gray-700">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="h-12 text-lg border-2 focus:border-blue-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-lg">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-700">Priority Level</Label>
              <RadioGroup
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                className="flex gap-8"
              >
                {priorities.map((priority) => (
                  <div key={priority} className="flex items-center space-x-3">
                    <RadioGroupItem value={priority} id={priority} className="w-5 h-5" />
                    <Label htmlFor={priority} className="text-lg font-medium cursor-pointer">
                      {priority}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="location" className="text-lg font-semibold text-gray-700">
              Location/Address *
            </Label>
            <div className="space-y-3">
              <div className="relative">
                <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <Input
                  id="location"
                  placeholder="Enter the location of the issue"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-12 text-lg pl-12 border-2 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGetLocation}
                disabled={loading || isGettingAddress}
                className="w-full h-12 text-lg border-2 hover:bg-blue-50 transition-colors bg-transparent"
              >
                {loading || isGettingAddress ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {loading ? "Getting Location..." : "Getting Address..."}
                  </>
                ) : (
                  <>
                    <Navigation className="mr-2 h-5 w-5" />
                    Use Current Location
                  </>
                )}
              </Button>
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
            </div>
          </div>

          {latitude && longitude && (
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-700">Location Preview</Label>
              <SimpleMap latitude={latitude} longitude={longitude} className="h-48 border-2 border-gray-200" />
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="photos" className="text-lg font-semibold text-gray-700">
              Upload Photos (Optional)
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors bg-gradient-to-br from-gray-50 to-white">
              <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <div className="space-y-2">
                <Label htmlFor="photos" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500 text-lg font-semibold">Click to upload</span>
                  <span className="text-gray-500 text-lg"> or drag and drop</span>
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
              <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB each</p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-6 w-6" />
                Submit Complaint
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
      <div className="space-y-6">
        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-xl border-0">
              <CardContent className="p-8">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-white/20 rounded-lg">
              <Search className="h-6 w-6" />
            </div>
            Search & Filter Complaints
          </CardTitle>
          <CardDescription className="text-green-100">Find and track community issues</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="search" className="text-lg font-semibold text-gray-700">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 text-lg pl-12 border-2 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="category-filter" className="text-lg font-semibold text-gray-700">
                Category
              </Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-12 text-lg border-2 focus:border-blue-500">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="status-filter" className="text-lg font-semibold text-gray-700">
                Status
              </Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-12 text-lg border-2 focus:border-blue-500">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
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

      <div className="grid gap-6">
        {complaintsWithDistance.map((complaint) => (
          <Card
            key={complaint.id}
            className="hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50"
          >
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl text-gray-900">{complaint.title}</h3>
                      <p className="text-sm text-gray-500 font-medium">ID: {complaint.id.slice(0, 8)}</p>
                    </div>
                    <div className="flex gap-3">
                      <Badge className={`${getPriorityColor(complaint.priority)} px-3 py-1 text-sm font-semibold`}>
                        {complaint.priority}
                      </Badge>
                      <Badge className={`${getStatusColor(complaint.status)} px-3 py-1 text-sm font-semibold`}>
                        {complaint.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-700 text-lg leading-relaxed">{complaint.description}</p>

                  <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">{complaint.location}</span>
                      {complaint.distance && (
                        <span className="text-blue-600 font-semibold">({complaint.distance.toFixed(1)} km away)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-500" />
                      <span className="font-medium">{complaint.date_submitted}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm font-semibold border-2">
                        {complaint.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-blue-200 hover:border-blue-300 transition-all duration-300"
                    onClick={() => handleUpvote(complaint.id, complaint.upvotes)}
                  >
                    <ThumbsUp className="h-5 w-5" />
                    <span className="font-semibold">{complaint.upvotes}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 hover:bg-gray-50 transition-colors bg-transparent"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {complaintsWithDistance.length === 0 && (
        <Card className="shadow-xl border-0">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700">No complaints found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
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
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow-xl border-0">
              <CardContent className="p-8">
                <Skeleton className="h-24 w-full" />
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
    <div className="space-y-8">
      {/* Hero Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-blue-100 font-medium">Total Complaints</p>
                <p className="text-4xl font-bold">{totalComplaints}</p>
                <p className="text-blue-200 text-sm">Community Issues</p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl">
                <FileText className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-green-100 font-medium">Resolved</p>
                <p className="text-4xl font-bold">{resolvedCount}</p>
                <p className="text-green-200 text-sm">{resolutionRate}% Success Rate</p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl">
                <CheckCircle className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-purple-100 font-medium">In Progress</p>
                <p className="text-4xl font-bold">{inProgressCount}</p>
                <p className="text-purple-200 text-sm">Being Addressed</p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl">
                <Clock className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-orange-100 font-medium">Pending</p>
                <p className="text-4xl font-bold">{pendingCount}</p>
                <p className="text-orange-200 text-sm">Awaiting Review</p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl">
                <AlertTriangle className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/20 rounded-lg">
                <PieChart className="h-6 w-6" />
              </div>
              Issues by Category
            </CardTitle>
            <CardDescription className="text-indigo-100">Distribution of community complaints</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {categoryStats.map((stat, index) => (
                <div key={stat.category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">{stat.category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 font-medium">
                        {Math.round((stat.count / totalComplaints) * 100)}%
                      </span>
                      <span className="text-lg font-bold text-gray-900 w-8">{stat.count}</span>
                    </div>
                  </div>
                  <Progress value={(stat.count / totalComplaints) * 100} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Issues */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/20 rounded-lg">
                <Activity className="h-6 w-6" />
              </div>
              Recent Community Issues
            </CardTitle>
            <CardDescription className="text-teal-100">Latest reported problems</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {recentIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-blue-200 transition-colors bg-gradient-to-r from-white to-gray-50"
                >
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-lg text-gray-900">{issue.title}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {issue.location}
                    </p>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(issue.status)} text-xs font-semibold`}>{issue.status}</Badge>
                      <span className="text-xs text-gray-500 font-medium">{issue.date_submitted}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="font-semibold">{issue.upvotes}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resolution Performance */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            Resolution Performance
          </CardTitle>
          <CardDescription className="text-emerald-100">Community issue resolution tracking</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-700">Overall Resolution Rate</span>
              <span className="text-4xl font-bold text-green-600">{resolutionRate}%</span>
            </div>

            <div className="space-y-4">
              <Progress value={resolutionRate} className="h-6" />
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                  <p className="text-3xl font-bold text-green-600">{resolvedCount}</p>
                  <p className="text-green-700 font-semibold">Resolved</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                  <p className="text-3xl font-bold text-blue-600">{inProgressCount}</p>
                  <p className="text-blue-700 font-semibold">In Progress</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200">
                  <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                  <p className="text-yellow-700 font-semibold">Pending</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Globe className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Smart Citizen Portal
            </h1>
          </div>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Empowering communities through technology. Report issues, track progress, and build a better future
            together.
          </p>
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-6 w-6 text-blue-500" />
              <span className="font-semibold">Community Driven</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Target className="h-6 w-6 text-green-500" />
              <span className="font-semibold">Results Focused</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Zap className="h-6 w-6 text-purple-500" />
              <span className="font-semibold">Real-time Updates</span>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="report" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-12 h-16 bg-white shadow-lg border-0 rounded-2xl p-2">
            <TabsTrigger
              value="report"
              className="flex items-center gap-3 text-lg font-semibold h-12 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
            >
              <FileText className="h-5 w-5" />
              Report Issue
            </TabsTrigger>
            <TabsTrigger
              value="track"
              className="flex items-center gap-3 text-lg font-semibold h-12 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300"
            >
              <Search className="h-5 w-5" />
              Track Complaints
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-3 text-lg font-semibold h-12 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
            >
              <BarChart3 className="h-5 w-5" />
              Community Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="flex items-center gap-3 text-lg font-semibold h-12 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white transition-all duration-300"
            >
              <Shield className="h-5 w-5" />
              Admin
            </TabsTrigger>
            <TabsTrigger
              value="department"
              className="flex items-center gap-3 text-lg font-semibold h-12 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-300"
            >
              <Building2 className="h-5 w-5" />
              Department
            </TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="mt-8">
            <ReportIssueForm />
          </TabsContent>

          <TabsContent value="track" className="mt-8">
            <TrackComplaints />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-8">
            <CommunityDashboard />
          </TabsContent>

          <TabsContent value="admin" className="mt-8">
            {isAdmin ? (
              <div className="space-y-4">
                <AdminDashboard />
              </div>
            ) : (
              <AdminLogin onLogin={setIsAdmin} />
            )}
          </TabsContent>
          <TabsContent value="department" className="mt-8">
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
