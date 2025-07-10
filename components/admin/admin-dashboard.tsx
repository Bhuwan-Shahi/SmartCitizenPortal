"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Users,
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  MoreHorizontal,
  Eye,
  Edit,
  Filter,
  Download,
  Bell,
  Shield,
  BarChart3,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { DepartmentAssignment } from "./department-assignment"

interface Department {
  id: string
  name: string
  description: string
  contact_email: string
  contact_phone: string | null
}

interface AdminComplaint {
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
  departments?: Department | null
}

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
  department: string | null
}

function getStatusColor(status: string) {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-300"
    case "Resolved":
      return "bg-green-100 text-green-800 border-green-300"
    case "Rejected":
      return "bg-red-100 text-red-800 border-red-300"
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

function AdminOverview({ complaints }: { complaints: AdminComplaint[] }) {
  const totalComplaints = complaints.length
  const pendingCount = complaints.filter((c) => c.status === "Pending").length
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length
  const highPriorityCount = complaints.filter((c) => c.priority === "High").length

  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0
  const avgResolutionTime = "3.2 days" // This would be calculated from actual data

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Complaints</p>
                <p className="text-3xl font-bold">{totalComplaints}</p>
                <p className="text-blue-200 text-xs">All time</p>
              </div>
              <FileText className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending Review</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
                <p className="text-yellow-200 text-xs">Needs attention</p>
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
                <p className="text-green-200 text-xs">This month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
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
              Department Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {["Roads & Infrastructure", "Utilities", "Sanitation", "Public Safety"].map((dept, index) => (
                <div key={dept} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{dept}</span>
                    <span className="text-gray-600">{85 - index * 5}%</span>
                  </div>
                  <Progress value={85 - index * 5} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Response Times
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{avgResolutionTime}</p>
                <p className="text-gray-600">Average Resolution Time</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
                  <p className="text-sm text-blue-700">Pending</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{inProgressCount}</p>
                  <p className="text-sm text-yellow-700">In Progress</p>
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

function ComplaintManagement() {
  const [complaints, setComplaints] = useState<AdminComplaint[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<AdminComplaint | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState("all")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // 1. Try to get departments first - if table doesn't exist, use empty array
      let deptData: Department[] = []
      try {
        const { data, error } = await supabase.from("departments").select("*")
        if (error && !error.message.includes('relation "public.departments" does not exist')) {
          throw error
        }
        deptData = data || []
      } catch (error) {
        console.warn("Departments table not found, using empty array")
        deptData = []
      }
      setDepartments(deptData)

      // 2. Try to get admin users - if table doesn't exist or no admin role, use empty array
      let userData: User[] = []
      try {
        const { data, error } = await supabase.from("users").select("*").eq("role", "admin")
        if (error && !error.message.includes('relation "public.users" does not exist')) {
          throw error
        }
        userData = data || []
      } catch (error) {
        console.warn("Users table not found or no admin users, using empty array")
        userData = []
      }
      setUsers(userData)

      // 3. Get complaints - this should exist
      const { data: compData, error: compErr } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false })

      if (compErr) throw compErr

      // 4. Enrich complaints with department info
      const enriched = (compData || []).map((c) => ({
        ...c,
        departments: deptData.find((d) => d.id === c.assigned_department_id) || null,
      })) as AdminComplaint[]

      setComplaints(enriched)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      })
      // Set empty arrays as fallback
      setComplaints([])
      setDepartments([])
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const updateComplaintStatus = async (complaintId: string, newStatus: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({
          status: newStatus,
          admin_notes: notes,
          actual_completion_date: newStatus === "Resolved" ? new Date().toISOString().split("T")[0] : null,
        })
        .eq("id", complaintId)

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
        prev.map((c) => (c.id === complaintId ? { ...c, status: newStatus, admin_notes: notes ?? c.admin_notes } : c)),
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

  const assignComplaint = async (complaintId: string, departmentId: string, userId?: string) => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({
          assigned_department_id: departmentId,
          assigned_to_user_id: userId || null,
          status: "In Progress",
        })
        .eq("id", complaintId)

      if (error) throw error

      // Add to status history
      await supabase.from("complaint_status_history").insert([
        {
          complaint_id: complaintId,
          new_status: "In Progress",
          notes: `Assigned to department: ${departments.find((d) => d.id === departmentId)?.name}`,
        },
      ])

      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId
            ? {
                ...c,
                assigned_department_id: departmentId,
                assigned_to_user_id: userId ?? null,
                status: "In Progress",
                departments: departments.find((d) => d.id === departmentId) ?? null,
              }
            : c,
        ),
      )

      toast({
        title: "Complaint Assigned Successfully!",
        description: `Complaint assigned to ${departments.find((d) => d.id === departmentId)?.name}`,
      })
    } catch (error) {
      console.error("Error assigning complaint:", error)
      toast({
        title: "Error",
        description: "Failed to assign complaint. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesStatus = filterStatus === "all" || complaint.status === filterStatus
    const matchesPriority = filterPriority === "all" || complaint.priority === filterPriority
    const matchesDepartment =
      filterDepartment === "all" ||
      (filterDepartment === "unassigned" && !complaint.assigned_department_id) ||
      complaint.assigned_department_id === filterDepartment
    return matchesStatus && matchesPriority && matchesDepartment
  })

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Complaints
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department</Label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                <Download className="h-4 w-4 mr-2" />
                Export Data
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
            Complaint Management ({filteredComplaints.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm">{complaint.id.slice(0, 8)}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate font-medium">{complaint.title}</div>
                    <div className="text-sm text-gray-500 truncate">{complaint.location}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{complaint.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {complaint.departments?.name ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {complaint.departments.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Unassigned
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{complaint.date_submitted}</TableCell>
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
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!complaint.assigned_department_id && (
                          <DropdownMenuItem onClick={() => setSelectedComplaint(complaint)}>
                            <Building2 className="h-4 w-4 mr-2" />
                            Assign Department
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => updateComplaintStatus(complaint.id, "In Progress")}
                          disabled={complaint.status === "In Progress"}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Mark In Progress
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
              ))}
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
                <DialogTitle className="text-xl">{selectedComplaint.title}</DialogTitle>
                <DialogDescription>
                  Complaint ID: {selectedComplaint.id} • Submitted: {selectedComplaint.date_submitted}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Status</Label>
                    <Badge className={`${getStatusColor(selectedComplaint.status)} mt-1`}>
                      {selectedComplaint.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="font-semibold">Priority</Label>
                    <Badge className={`${getPriorityColor(selectedComplaint.priority)} mt-1`}>
                      {selectedComplaint.priority}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="font-semibold">Description</Label>
                  <p className="mt-1 text-gray-700">{selectedComplaint.description}</p>
                </div>

                <div>
                  <Label className="font-semibold">Location</Label>
                  <p className="mt-1 text-gray-700">{selectedComplaint.location}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Assign Department</Label>
                    <Select
                      value={selectedComplaint.assigned_department_id || "unassigned"}
                      onValueChange={(value) => assignComplaint(selectedComplaint.id, value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              {dept.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedComplaint.assigned_department_id && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border">
                        <p className="text-sm text-blue-700">
                          <strong>Contact:</strong> {selectedComplaint.departments?.contact_email}
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="font-semibold">Community Support</Label>
                    <p className="mt-1 text-gray-700">{selectedComplaint.upvotes} upvotes</p>
                    <div className="mt-2">
                      <Label className="font-semibold text-sm">Priority Level</Label>
                      <Badge className={`${getPriorityColor(selectedComplaint.priority)} mt-1`}>
                        {selectedComplaint.priority}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="font-semibold">Admin Notes</Label>
                  <Textarea
                    value={selectedComplaint.admin_notes || ""}
                    onChange={(e) =>
                      setSelectedComplaint({
                        ...selectedComplaint,
                        admin_notes: e.target.value,
                      })
                    }
                    placeholder="Add internal notes..."
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() =>
                    updateComplaintStatus(selectedComplaint.id, "Resolved", selectedComplaint.admin_notes || undefined)
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
                      selectedComplaint.admin_notes || undefined,
                    )
                  }
                  variant="outline"
                  disabled={selectedComplaint.status === "In Progress"}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Mark In Progress
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase.from("departments").select("*")
      if (error) throw error
      setDepartments(data || [])
    } catch (error) {
      console.error("Error fetching departments:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading departments...</div>
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Department Management
          </CardTitle>
          <CardDescription className="text-teal-100">Manage government departments and assignments</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card key={dept.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <CardDescription>{dept.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Email:</span>
                      <span className="text-blue-600">{dept.contact_email}</span>
                    </div>
                    {dept.contact_phone && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Phone:</span>
                        <span>{dept.contact_phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="h-4 w-4 mr-1" />
                      Staff
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AdminDashboard() {
  const [complaints, setComplaints] = useState<AdminComplaint[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      setLoading(true)

      // Try to get departments - handle if table doesn't exist
      let deptData: Department[] = []
      try {
        const { data, error } = await supabase.from("departments").select("*")
        if (error && !error.message.includes('relation "public.departments" does not exist')) {
          throw error
        }
        deptData = data || []
      } catch (error) {
        console.warn("Departments table not found")
        deptData = []
      }
      setDepartments(deptData)

      // Get complaints
      const { data: compData, error: compErr } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false })

      if (compErr) throw compErr

      const enriched = (compData || []).map((c) => ({
        ...c,
        departments: deptData.find((d) => d.id === c.assigned_department_id) || null,
      })) as AdminComplaint[]

      setComplaints(enriched)
    } catch (error) {
      console.error("Error fetching complaints:", error)
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Government Admin Dashboard
              </h1>
              <p className="text-xl text-gray-600 mt-2">Manage citizen complaints and track department performance</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="lg">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </Button>
              <Avatar>
                <AvatarFallback>
                  <Shield className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-14 bg-white shadow-lg border-0 rounded-xl p-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 text-lg font-semibold h-12 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <BarChart3 className="h-5 w-5" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="complaints"
              className="flex items-center gap-2 text-lg font-semibold h-12 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              <FileText className="h-5 w-5" />
              Complaints
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="flex items-center gap-2 text-lg font-semibold h-12 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
            >
              <Building2 className="h-5 w-5" />
              Assignments
            </TabsTrigger>
            <TabsTrigger
              value="departments"
              className="flex items-center gap-2 text-lg font-semibold h-12 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Users className="h-5 w-5" />
              Departments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {loading ? <div>Loading...</div> : <AdminOverview complaints={complaints} />}
          </TabsContent>

          <TabsContent value="complaints">
            <ComplaintManagement />
          </TabsContent>

          <TabsContent value="assignments">
            <DepartmentAssignment
              complaints={complaints}
              departments={departments}
              onAssignmentUpdate={fetchComplaints}
            />
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
