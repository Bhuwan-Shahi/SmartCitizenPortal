"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  MoreHorizontal,
  Eye,
  Filter,
  Download,
  Bell,
  User,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  Target,
  Timer,
  Users,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface Department {
  id: string
  name: string
  description: string
  contact_email: string
  contact_phone: string | null
}

interface DepartmentComplaint {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  location: string
  date_submitted: string
  upvotes: number
  assigned_department_id: string | null
  assigned_to_user_id: string | null
  admin_notes: string | null
  resolution_notes: string | null
  estimated_completion_date: string | null
  actual_completion_date: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
}

interface DepartmentUser {
  id: string
  email: string
  full_name: string | null
  role: string
  department: string | null
}

interface DepartmentDashboardProps {
  departmentId: string
  departmentName: string
}

function getStatusColor(status: string) {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-300"
    case "Resolved":
      return "bg-green-100 text-green-800 border-green-300"
    case "On Hold":
      return "bg-gray-100 text-gray-800 border-gray-300"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "Low":
      return "bg-gray-100 text-gray-800 border-gray-300"
    case "Medium":
      return "bg-orange-100 text-orange-800 border-orange-300"
    case "High":
      return "bg-red-100 text-red-800 border-red-300"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

function DepartmentOverview({ complaints, department }: { complaints: DepartmentComplaint[]; department: Department }) {
  const totalComplaints = complaints.length
  const pendingCount = complaints.filter((c) => c.status === "Pending").length
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length
  const highPriorityCount = complaints.filter((c) => c.priority === "High").length

  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0

  // Calculate average resolution time (mock calculation)
  const avgResolutionDays = resolvedCount > 0 ? Math.round(Math.random() * 5 + 2) : 0

  // Get overdue complaints (estimated completion date passed)
  const today = new Date().toISOString().split("T")[0]
  const overdueCount = complaints.filter(
    (c) => c.estimated_completion_date && c.estimated_completion_date < today && c.status !== "Resolved",
  ).length

  return (
    <div className="space-y-8">
      {/* Department Info Header */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">{department.name}</h2>
              <p className="text-blue-100 text-lg">{department.description}</p>
              <div className="flex items-center gap-6 text-blue-200">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{department.contact_email}</span>
                </div>
                {department.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{department.contact_phone}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-white/20 rounded-xl">
              <Building2 className="h-12 w-12" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Assigned</p>
                <p className="text-3xl font-bold">{totalComplaints}</p>
                <p className="text-blue-200 text-xs">Active complaints</p>
              </div>
              <FileText className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold">{inProgressCount}</p>
                <p className="text-yellow-200 text-xs">Being worked on</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Resolution Rate</p>
                <p className="text-3xl font-bold">{resolutionRate}%</p>
                <p className="text-green-200 text-xs">Success rate</p>
              </div>
              <Target className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">High Priority</p>
                <p className="text-3xl font-bold">{highPriorityCount}</p>
                <p className="text-red-200 text-xs">Urgent issues</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Resolution Rate</span>
                  <span className="text-gray-600">{resolutionRate}%</span>
                </div>
                <Progress value={resolutionRate} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{avgResolutionDays}</p>
                  <p className="text-sm text-blue-700">Avg. Resolution Days</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                  <p className="text-sm text-red-700">Overdue Items</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                  <p className="text-sm text-yellow-700">Pending</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
                  <p className="text-sm text-blue-700">In Progress</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
                  <p className="text-sm text-green-700">Resolved</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ComplaintWorkQueue({ departmentId }: { departmentId: string }) {
  const [complaints, setComplaints] = useState<DepartmentComplaint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<DepartmentComplaint | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")

  useEffect(() => {
    fetchComplaints()
  }, [departmentId])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("assigned_department_id", departmentId)
        .order("created_at", { ascending: false })

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

  const updateComplaintStatus = async (complaintId: string, newStatus: string, notes?: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        resolution_notes: notes,
        updated_at: new Date().toISOString(),
      }

      if (newStatus === "Resolved") {
        updateData.actual_completion_date = new Date().toISOString().split("T")[0]
      }

      const { error } = await supabase.from("complaints").update(updateData).eq("id", complaintId)

      if (error) throw error

      // Add to status history
      await supabase.from("complaint_status_history").insert([
        {
          complaint_id: complaintId,
          new_status: newStatus,
          notes: notes,
        },
      ])

      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId
            ? { ...c, status: newStatus, resolution_notes: notes ?? c.resolution_notes, ...updateData }
            : c,
        ),
      )

      toast({
        title: "Status Updated",
        description: `Complaint status changed to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const setEstimatedCompletion = async (complaintId: string, date: string) => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ estimated_completion_date: date })
        .eq("id", complaintId)

      if (error) throw error

      setComplaints((prev) => prev.map((c) => (c.id === complaintId ? { ...c, estimated_completion_date: date } : c)))

      toast({
        title: "Completion Date Set",
        description: `Estimated completion date set to ${date}`,
      })
    } catch (error) {
      console.error("Error setting completion date:", error)
      toast({
        title: "Error",
        description: "Failed to set completion date. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesStatus = filterStatus === "all" || complaint.status === filterStatus
    const matchesPriority = filterPriority === "all" || complaint.priority === filterPriority
    return matchesStatus && matchesPriority
  })

  // Sort by priority and date
  const sortedComplaints = filteredComplaints.sort((a, b) => {
    const priorityOrder = { High: 3, Medium: 2, Low: 1 }
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0

    if (aPriority !== bPriority) {
      return bPriority - aPriority // High priority first
    }

    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime() // Older first
  })

  if (loading) {
    return <div className="p-8">Loading complaints...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Work Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                <Download className="h-4 w-4 mr-2" />
                Export Queue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Work Queue ({sortedComplaints.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Priority</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Est. Completion</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedComplaints.map((complaint) => {
                const isOverdue =
                  complaint.estimated_completion_date &&
                  complaint.estimated_completion_date < new Date().toISOString().split("T")[0] &&
                  complaint.status !== "Resolved"

                return (
                  <TableRow key={complaint.id} className={`hover:bg-gray-50 ${isOverdue ? "bg-red-50" : ""}`}>
                    <TableCell>
                      <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="space-y-1">
                        <div className="font-medium truncate">{complaint.title}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {complaint.upvotes} community votes
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                      {isOverdue && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Overdue
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{complaint.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{complaint.date_submitted}</TableCell>
                    <TableCell className="text-sm">
                      {complaint.estimated_completion_date || <span className="text-gray-400 italic">Not set</span>}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedComplaint(complaint)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => updateComplaintStatus(complaint.id, "In Progress")}
                            disabled={complaint.status === "In Progress"}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Start Work
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateComplaintStatus(complaint.id, "Resolved")}
                            disabled={complaint.status === "Resolved"}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Complaint Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedComplaint && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {selectedComplaint.title}
                </DialogTitle>
                <DialogDescription>
                  Complaint ID: {selectedComplaint.id} • Submitted: {selectedComplaint.date_submitted}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Current Status</Label>
                    <Badge className={`${getStatusColor(selectedComplaint.status)} mt-1`}>
                      {selectedComplaint.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="font-semibold">Priority Level</Label>
                    <Badge className={`${getPriorityColor(selectedComplaint.priority)} mt-1`}>
                      {selectedComplaint.priority}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="font-semibold">Description</Label>
                  <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedComplaint.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Location</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <p className="text-gray-700">{selectedComplaint.location}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold">Community Support</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <p className="text-gray-700">{selectedComplaint.upvotes} citizen votes</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Estimated Completion</Label>
                    <input
                      type="date"
                      value={selectedComplaint.estimated_completion_date || ""}
                      onChange={(e) => setEstimatedCompletion(selectedComplaint.id, e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold">Update Status</Label>
                    <Select
                      value={selectedComplaint.status}
                      onValueChange={(value) => updateComplaintStatus(selectedComplaint.id, value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="font-semibold">Resolution Notes</Label>
                  <Textarea
                    value={selectedComplaint.resolution_notes || ""}
                    onChange={(e) =>
                      setSelectedComplaint({
                        ...selectedComplaint,
                        resolution_notes: e.target.value,
                      })
                    }
                    placeholder="Add notes about the resolution process, actions taken, or additional information..."
                    className="mt-1"
                    rows={4}
                  />
                </div>

                {selectedComplaint.admin_notes && (
                  <div>
                    <Label className="font-semibold">Admin Notes</Label>
                    <p className="mt-1 text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      {selectedComplaint.admin_notes}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={() =>
                    updateComplaintStatus(
                      selectedComplaint.id,
                      "Resolved",
                      selectedComplaint.resolution_notes || undefined,
                    )
                  }
                  className="bg-green-600 hover:bg-green-700"
                  disabled={selectedComplaint.status === "Resolved"}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Resolved
                </Button>
                <Button
                  onClick={() =>
                    updateComplaintStatus(
                      selectedComplaint.id,
                      "In Progress",
                      selectedComplaint.resolution_notes || undefined,
                    )
                  }
                  variant="outline"
                  disabled={selectedComplaint.status === "In Progress"}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Start Working
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function DepartmentDashboard({ departmentId, departmentName }: DepartmentDashboardProps) {
  const [complaints, setComplaints] = useState<DepartmentComplaint[]>([])
  const [department, setDepartment] = useState<Department | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDepartmentData()
  }, [departmentId])

  const fetchDepartmentData = async () => {
    try {
      setLoading(true)

      // Fetch department info
      const { data: deptData, error: deptError } = await supabase
        .from("departments")
        .select("*")
        .eq("id", departmentId)
        .single()

      if (deptError) throw deptError
      setDepartment(deptData)

      // Fetch department complaints
      const { data: compData, error: compError } = await supabase
        .from("complaints")
        .select("*")
        .eq("assigned_department_id", departmentId)
        .order("created_at", { ascending: false })

      if (compError) throw compError
      setComplaints(compData || [])
    } catch (error) {
      console.error("Error fetching department data:", error)
      toast({
        title: "Error",
        description: "Failed to load department data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading department dashboard...</div>
  }

  if (!department) {
    return <div className="p-8">Department not found.</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {department.name} Dashboard
              </h1>
              <p className="text-xl text-gray-600 mt-2">Manage your department's assigned complaints and tasks</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="lg">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </Button>
              <Avatar>
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-white shadow-lg border-0 rounded-xl p-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 text-lg font-semibold h-12 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <BarChart3 className="h-5 w-5" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="workqueue"
              className="flex items-center gap-2 text-lg font-semibold h-12 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              <FileText className="h-5 w-5" />
              Work Queue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DepartmentOverview complaints={complaints} department={department} />
          </TabsContent>

          <TabsContent value="workqueue">
            <ComplaintWorkQueue departmentId={departmentId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
