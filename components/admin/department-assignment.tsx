"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Building2, Clock, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

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
  departments?: Department | null
}

interface DepartmentAssignmentProps {
  complaints: AdminComplaint[]
  departments: Department[]
  onAssignmentUpdate: () => void
}

function getStatusColor(status: string) {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-300"
    case "Resolved":
      return "bg-green-100 text-green-800 border-green-300"
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

export function DepartmentAssignment({ complaints, departments, onAssignmentUpdate }: DepartmentAssignmentProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<AdminComplaint | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [isAssigning, setIsAssigning] = useState(false)

  const unassignedComplaints = complaints.filter((c) => !c.assigned_department_id && c.status === "Pending")
  const departmentStats = departments.map((dept) => ({
    ...dept,
    assignedCount: complaints.filter((c) => c.assigned_department_id === dept.id).length,
    resolvedCount: complaints.filter((c) => c.assigned_department_id === dept.id && c.status === "Resolved").length,
  }))

  const assignComplaint = async (complaintId: string, departmentId: string) => {
    setIsAssigning(true)
    try {
      const { error } = await supabase
        .from("complaints")
        .update({
          assigned_department_id: departmentId,
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

      toast({
        title: "Assignment Successful!",
        description: `Complaint assigned to ${departments.find((d) => d.id === departmentId)?.name}`,
      })

      onAssignmentUpdate()
      setSelectedComplaint(null)
      setSelectedDepartment("")
    } catch (error) {
      console.error("Error assigning complaint:", error)
      toast({
        title: "Assignment Failed",
        description: "Failed to assign complaint. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const getCategoryDepartmentSuggestion = (category: string): Department | null => {
    const categoryMapping: Record<string, string> = {
      Roads: "Roads & Infrastructure",
      Utilities: "Utilities",
      Sanitation: "Sanitation",
      "Public Safety": "Public Safety",
      "Water Supply": "Utilities",
      "Public Transport": "Public Transport",
      Parks: "Parks & Recreation",
    }

    const suggestedDeptName = categoryMapping[category]
    return departments.find((d) => d.name === suggestedDeptName) || null
  }

  return (
    <div className="space-y-8">
      {/* Department Performance Overview */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Department Assignment Overview
          </CardTitle>
          <CardDescription className="text-indigo-100">Track department workload and performance</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departmentStats.map((dept) => (
              <Card key={dept.id} className="border-2 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {dept.name}
                    <Badge variant="outline" className="ml-2">
                      {dept.assignedCount} active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Assigned:</span>
                      <span className="font-semibold">{dept.assignedCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Resolved:</span>
                      <span className="font-semibold text-green-600">{dept.resolvedCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Success Rate:</span>
                      <span className="font-semibold">
                        {dept.assignedCount > 0 ? Math.round((dept.resolvedCount / dept.assignedCount) * 100) : 0}%
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600">{dept.contact_email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unassigned Complaints */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Unassigned Complaints ({unassignedComplaints.length})
          </CardTitle>
          <CardDescription className="text-red-100">Complaints waiting for department assignment</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {unassignedComplaints.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">All Caught Up!</h3>
              <p className="text-gray-500">No unassigned complaints at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unassignedComplaints.map((complaint) => {
                const suggestedDept = getCategoryDepartmentSuggestion(complaint.category)
                return (
                  <Card key={complaint.id} className="border-l-4 border-l-red-400 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-lg">{complaint.title}</h4>
                            <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                            <Badge variant="outline">{complaint.category}</Badge>
                          </div>
                          <p className="text-gray-600 text-sm">{complaint.location}</p>
                          <p className="text-gray-700">{complaint.description}</p>
                          {suggestedDept && (
                            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                              <Building2 className="h-4 w-4" />
                              <span>Suggested: {suggestedDept.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            onClick={() => setSelectedComplaint(complaint)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Building2 className="h-4 w-4 mr-2" />
                            Assign
                          </Button>
                          {suggestedDept && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => assignComplaint(complaint.id, suggestedDept.id)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              Quick Assign
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="max-w-2xl">
          {selectedComplaint && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Assign Department
                </DialogTitle>
                <DialogDescription>Assign "{selectedComplaint.title}" to the appropriate department</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Complaint Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span> {selectedComplaint.category}
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span>
                      <Badge className={`${getPriorityColor(selectedComplaint.priority)} ml-2`}>
                        {selectedComplaint.priority}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Location:</span> {selectedComplaint.location}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Department</label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <span>{dept.name}</span>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {departmentStats.find((d) => d.id === dept.id)?.assignedCount || 0} active
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDepartment && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-blue-800 mb-2">Department Information</h5>
                    {(() => {
                      const dept = departments.find((d) => d.id === selectedDepartment)
                      const stats = departmentStats.find((d) => d.id === selectedDepartment)
                      return dept ? (
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>Description:</strong> {dept.description}
                          </p>
                          <p>
                            <strong>Contact:</strong> {dept.contact_email}
                          </p>
                          <p>
                            <strong>Current Workload:</strong> {stats?.assignedCount || 0} active complaints
                          </p>
                          <p>
                            <strong>Success Rate:</strong>{" "}
                            {stats && stats.assignedCount > 0
                              ? Math.round((stats.resolvedCount / stats.assignedCount) * 100)
                              : 0}
                            %
                          </p>
                        </div>
                      ) : null
                    })()}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  onClick={() => selectedDepartment && assignComplaint(selectedComplaint.id, selectedDepartment)}
                  disabled={!selectedDepartment || isAssigning}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isAssigning ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Assign to Department
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
