"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LogOut, Calendar, Users, UserPlus, MessageSquare, CheckCircle, XCircle, AlertCircle } from "lucide-react"

// Mock data for demo - includes multiple admins and their teams
const MOCK_USERS = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@test.com",
    primaryTeams: ["usher", "greeter"],
    secondaryTeams: ["prayer", "hospitality"],
    status: "active",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@test.com",
    primaryTeams: ["music", "greeter"],
    secondaryTeams: ["hospitality"],
    status: "active",
  },
  {
    id: 3,
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.j@test.com",
    primaryTeams: ["security"],
    secondaryTeams: ["strike", "greeter"],
    status: "active",
  },
  {
    id: 4,
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.w@test.com",
    primaryTeams: ["greeter"],
    secondaryTeams: ["prayer"],
    status: "active",
  },
  {
    id: 5,
    firstName: "David",
    lastName: "Brown",
    email: "david.b@test.com",
    primaryTeams: ["hospitality"],
    secondaryTeams: ["greeter", "usher"],
    status: "active",
  },
]

const MOCK_ADMINS = [
  { id: 999, name: "Will Johnson", team: "greeter", email: "admin@scc.com" },
  { id: 998, name: "Music Leader", team: "music", email: "music@scc.com" },
  { id: 997, name: "Security Chief", team: "security", email: "security@scc.com" },
  { id: 996, name: "Hospitality Lead", team: "hospitality", email: "hospitality@scc.com" },
  { id: 995, name: "Usher Captain", team: "usher", email: "usher@scc.com" },
  { id: 994, name: "Prayer Coordinator", team: "prayer", email: "prayer@scc.com" },
  { id: 993, name: "Strike Team Lead", team: "strike", email: "strike@scc.com" },
]

const TEAMS = ["usher", "greeter", "prayer", "music", "security", "strike", "hospitality"]

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [users, setUsers] = useState(MOCK_USERS)
  const [selectedDate, setSelectedDate] = useState("")
  const [assignments, setAssignments] = useState<any>({})
  const [requests, setRequests] = useState<any>([])
  const [generalRequests, setGeneralRequests] = useState<any>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [generalRequestDialog, setGeneralRequestDialog] = useState(false)
  const [requestMessage, setRequestMessage] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/admin/signin")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      router.push("/")
      return
    }

    setAdmin(parsedUser)

    // Set default date to next Sunday
    const today = new Date()
    const nextSunday = new Date(today)
    nextSunday.setDate(today.getDate() + (7 - today.getDay()))
    setSelectedDate(nextSunday.toISOString().split("T")[0])

    // Load saved data
    const savedAssignments = localStorage.getItem("assignments")
    const savedRequests = localStorage.getItem("requests")
    const savedGeneralRequests = localStorage.getItem("generalRequests")

    if (savedAssignments) setAssignments(JSON.parse(savedAssignments))
    if (savedRequests) setRequests(JSON.parse(savedRequests))
    if (savedGeneralRequests) setGeneralRequests(JSON.parse(savedGeneralRequests))
  }, [router])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("assignments", JSON.stringify(assignments))
  }, [assignments])

  useEffect(() => {
    localStorage.setItem("requests", JSON.stringify(requests))
  }, [requests])

  useEffect(() => {
    localStorage.setItem("generalRequests", JSON.stringify(generalRequests))
  }, [generalRequests])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const getNextSundays = (count = 16) => {
    const sundays = []
    const today = new Date()
    const nextSunday = new Date(today)
    nextSunday.setDate(today.getDate() + (7 - today.getDay()))

    for (let i = 0; i < count; i++) {
      const sunday = new Date(nextSunday)
      sunday.setDate(nextSunday.getDate() + i * 7)
      sundays.push(sunday)
    }

    return sundays
  }

  const getUserAssignedTeam = (userId: number, date: string) => {
    const dayAssignments = assignments[date] || {}
    for (const [team, assignedUsers] of Object.entries(dayAssignments)) {
      if ((assignedUsers as number[]).includes(userId)) {
        const teamAdmin = MOCK_ADMINS.find((a) => a.team === team)
        return { team, adminName: teamAdmin?.name || "Unknown" }
      }
    }
    return null
  }

  const assignUser = (userId: number, team: string) => {
    const existingAssignment = getUserAssignedTeam(userId, selectedDate)

    if (existingAssignment) {
      // User is already assigned, can't assign directly
      alert(
        `This user is already assigned to ${existingAssignment.team} by ${existingAssignment.adminName}. Use the request feature to ask for them.`,
      )
      return
    }

    setAssignments((prev) => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [team]: [...(prev[selectedDate]?.[team] || []), userId],
      },
    }))
  }

  const removeAssignment = (userId: number, team: string) => {
    // Only allow removal if this admin owns the team
    if (team !== admin.team) {
      alert("You can only remove users from your own team.")
      return
    }

    setAssignments((prev) => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [team]: prev[selectedDate]?.[team]?.filter((id: number) => id !== userId) || [],
      },
    }))
  }

  const requestUser = (userId: number, fromTeam: string, toTeam: string, message: string) => {
    const user = users.find((u) => u.id === userId)
    const fromAdmin = MOCK_ADMINS.find((a) => a.team === fromTeam)

    const newRequest = {
      id: Date.now(),
      userId,
      userName: `${user?.firstName} ${user?.lastName}`,
      fromTeam,
      toTeam,
      fromAdmin: fromAdmin?.name || "Unknown",
      toAdmin: admin.name,
      message,
      date: selectedDate,
      status: "pending",
      timestamp: new Date().toISOString(),
    }

    setRequests((prev) => [...prev, newRequest])
    setRequestDialogOpen(false)
    setRequestMessage("")
  }

  const approveRequest = (requestId: number) => {
    const request = requests.find((r: any) => r.id === requestId)
    if (!request) return

    // Move user from old team to new team
    setAssignments((prev) => {
      const newAssignments = { ...prev }
      const dateAssignments = newAssignments[request.date] || {}

      // Remove from old team
      if (dateAssignments[request.fromTeam]) {
        dateAssignments[request.fromTeam] = dateAssignments[request.fromTeam].filter(
          (id: number) => id !== request.userId,
        )
      }

      // Add to new team
      dateAssignments[request.toTeam] = [...(dateAssignments[request.toTeam] || []), request.userId]

      newAssignments[request.date] = dateAssignments
      return newAssignments
    })

    // Update request status
    setRequests((prev) => prev.map((r: any) => (r.id === requestId ? { ...r, status: "approved" } : r)))
  }

  const denyRequest = (requestId: number) => {
    setRequests((prev) => prev.map((r: any) => (r.id === requestId ? { ...r, status: "denied" } : r)))
  }

  const sendGeneralRequest = (message: string) => {
    const newRequest = {
      id: Date.now(),
      team: admin.team,
      adminName: admin.firstName,
      message,
      timestamp: new Date().toISOString(),
    }

    setGeneralRequests((prev) => [...prev, newRequest])
    setGeneralRequestDialog(false)
    setRequestMessage("")
  }

  if (!admin) return <div>Loading...</div>

  const sundays = getNextSundays()
  const selectedDateObj = new Date(selectedDate)
  const dayAssignments = assignments[selectedDate] || {}

  // Get requests for this admin's team
  const incomingRequests = requests.filter((r: any) => r.fromTeam === admin.team && r.status === "pending")
  const outgoingRequests = requests.filter((r: any) => r.toTeam === admin.team)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
              <p className="text-sm text-gray-600">
                {admin.firstName} {admin.lastName} - {admin.team.charAt(0).toUpperCase() + admin.team.slice(1)} Team
                Leader
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            onClick={() => setActiveTab("overview")}
            className="px-4 py-2"
          >
            <Users className="h-4 w-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === "schedule" ? "default" : "ghost"}
            onClick={() => setActiveTab("schedule")}
            className="px-4 py-2"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button
            variant={activeTab === "requests" ? "default" : "ghost"}
            onClick={() => setActiveTab("requests")}
            className="px-4 py-2 relative"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Requests
            {incomingRequests.length > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                {incomingRequests.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Team Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEAMS.map((team) => {
                const teamUsers = users.filter((u) => u.primaryTeams.includes(team) || u.secondaryTeams.includes(team))
                const teamAdmin = MOCK_ADMINS.find((a) => a.team === team)
                const isMyTeam = team === admin.team

                return (
                  <Card key={team} className={isMyTeam ? "ring-2 ring-blue-500" : ""}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg capitalize flex items-center justify-between">
                        {team}
                        {isMyTeam && (
                          <Badge variant="default" className="text-xs">
                            Your Team
                          </Badge>
                        )}
                      </CardTitle>
                      {teamAdmin && <CardDescription className="text-xs">Leader: {teamAdmin.name}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600 mb-2">{teamUsers.length}</div>
                      <div className="text-sm text-gray-600">
                        {teamUsers.filter((u) => u.primaryTeams.includes(team)).length} primary,{" "}
                        {teamUsers.filter((u) => u.secondaryTeams.includes(team)).length} secondary
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* My Team Members */}
            <Card>
              <CardHeader>
                <CardTitle>Your {admin.team.charAt(0).toUpperCase() + admin.team.slice(1)} Team Members</CardTitle>
                <CardDescription>People available for your team</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role in Your Team</TableHead>
                      <TableHead>Other Teams</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .filter(
                        (user) => user.primaryTeams.includes(admin.team) || user.secondaryTeams.includes(admin.team),
                      )
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.primaryTeams.includes(admin.team) ? "default" : "secondary"}>
                              {user.primaryTeams.includes(admin.team) ? "Primary" : "Secondary"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {[...user.primaryTeams, ...user.secondaryTeams]
                                .filter((team) => team !== admin.team)
                                .map((team) => (
                                  <Badge key={team} variant="outline" className="text-xs">
                                    {team}
                                  </Badge>
                                ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div className="space-y-6">
            {/* Date Selection and General Request */}
            <div className="flex justify-between items-center">
              <Card className="flex-1 mr-4">
                <CardHeader>
                  <CardTitle>Select Sunday</CardTitle>
                  <CardDescription>Choose a date to manage team assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select a Sunday" />
                    </SelectTrigger>
                    <SelectContent>
                      {sundays.map((sunday) => (
                        <SelectItem key={sunday.toISOString()} value={sunday.toISOString().split("T")[0]}>
                          {sunday.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Dialog open={generalRequestDialog} onOpenChange={setGeneralRequestDialog}>
                <DialogTrigger asChild>
                  <Button className="h-20 px-6">
                    <div className="text-center">
                      <MessageSquare className="h-6 w-6 mx-auto mb-1" />
                      <div className="text-sm">
                        Request More
                        <br />
                        Volunteers
                      </div>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request More Volunteers</DialogTitle>
                    <DialogDescription>Send a general request for more people on your team</DialogDescription>
                  </DialogHeader>
                  <Textarea
                    placeholder={`${admin.firstName} requested 1 more ${admin.team}...`}
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                  />
                  <DialogFooter>
                    <Button onClick={() => sendGeneralRequest(requestMessage)}>Send Request</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Team Assignments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {TEAMS.map((team) => {
                const teamAdmin = MOCK_ADMINS.find((a) => a.team === team)
                const assignedUsers = dayAssignments[team] || []
                const availableUsers = users.filter(
                  (u) =>
                    (u.primaryTeams.includes(team) || u.secondaryTeams.includes(team)) &&
                    !getUserAssignedTeam(u.id, selectedDate),
                )
                const isMyTeam = team === admin.team

                return (
                  <Card key={team} className={isMyTeam ? "ring-2 ring-blue-500" : ""}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="capitalize">{team} Team</span>
                        <div className="flex items-center gap-2">
                          {isMyTeam && (
                            <Badge variant="default" className="text-xs">
                              Your Team
                            </Badge>
                          )}
                          {teamAdmin && (
                            <Badge variant="outline" className="text-xs">
                              {teamAdmin.name}
                            </Badge>
                          )}
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {selectedDateObj.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Assigned Members */}
                      <div>
                        <h4 className="font-medium text-sm mb-2">Assigned ({assignedUsers.length})</h4>
                        <div className="space-y-2">
                          {assignedUsers.map((userId: number) => {
                            const user = users.find((u) => u.id === userId)
                            if (!user) return null

                            return (
                              <div
                                key={userId}
                                className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
                              >
                                <span className="text-sm">
                                  {user.firstName} {user.lastName}
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {user.primaryTeams.includes(team) ? "Primary" : "Secondary"}
                                  </Badge>
                                </span>
                                {isMyTeam && (
                                  <Button
                                    onClick={() => removeAssignment(userId, team)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-600"
                                  >
                                    ×
                                  </Button>
                                )}
                              </div>
                            )
                          })}
                          {assignedUsers.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No one assigned yet</p>
                          )}
                        </div>
                      </div>

                      {/* Available Members (only for my team) */}
                      {isMyTeam && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Available ({availableUsers.length})</h4>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {availableUsers.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-2 bg-gray-50 border rounded cursor-pointer hover:bg-gray-100"
                                onClick={() => assignUser(user.id, team)}
                              >
                                <span className="text-sm">
                                  {user.firstName} {user.lastName}
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {user.primaryTeams.includes(team) ? "Primary" : "Secondary"}
                                  </Badge>
                                </span>
                                <UserPlus className="h-4 w-4 text-blue-600" />
                              </div>
                            ))}
                            {availableUsers.length === 0 && (
                              <p className="text-sm text-gray-500 italic">No available members</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Request Users (for other teams) */}
                      {!isMyTeam && assignedUsers.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Request from {teamAdmin?.name}</h4>
                          <div className="space-y-1">
                            {assignedUsers.map((userId: number) => {
                              const user = users.find((u) => u.id === userId)
                              if (!user) return null

                              // Check if user is available for my team
                              const canRequest =
                                user.primaryTeams.includes(admin.team) || user.secondaryTeams.includes(admin.team)

                              if (!canRequest) return null

                              return (
                                <Dialog key={userId}>
                                  <DialogTrigger asChild>
                                    <div className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded cursor-pointer hover:bg-yellow-100">
                                      <span className="text-sm">
                                        {user.firstName} {user.lastName}
                                        <Badge variant="outline" className="ml-2 text-xs">
                                          Can do {admin.team}
                                        </Badge>
                                      </span>
                                      <MessageSquare className="h-4 w-4 text-orange-600" />
                                    </div>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>
                                        Request {user.firstName} {user.lastName}
                                      </DialogTitle>
                                      <DialogDescription>
                                        Request this person from {teamAdmin?.name} ({team} team) for your {admin.team}{" "}
                                        team
                                      </DialogDescription>
                                    </DialogHeader>
                                    <Textarea
                                      placeholder="Hi, I'd like to request this person for my team because..."
                                      value={requestMessage}
                                      onChange={(e) => setRequestMessage(e.target.value)}
                                    />
                                    <DialogFooter>
                                      <Button onClick={() => requestUser(userId, team, admin.team, requestMessage)}>
                                        Send Request
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            {/* Incoming Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                  Incoming Requests ({incomingRequests.length})
                </CardTitle>
                <CardDescription>Other team leaders requesting your team members</CardDescription>
              </CardHeader>
              <CardContent>
                {incomingRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending requests</p>
                ) : (
                  <div className="space-y-4">
                    {incomingRequests.map((request: any) => (
                      <div key={request.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">
                              {request.toAdmin} wants {request.userName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              For {request.toTeam} team on {new Date(request.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm mt-2 italic">"{request.message}"</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveRequest(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => denyRequest(request.id)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Deny
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Outgoing Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Your Requests ({outgoingRequests.length})</CardTitle>
                <CardDescription>Requests you've sent to other team leaders</CardDescription>
              </CardHeader>
              <CardContent>
                {outgoingRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No requests sent</p>
                ) : (
                  <div className="space-y-4">
                    {outgoingRequests.map((request: any) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Requested {request.userName}</h4>
                            <p className="text-sm text-gray-600">
                              From {request.fromAdmin} ({request.fromTeam} team) on{" "}
                              {new Date(request.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm mt-2 italic">"{request.message}"</p>
                          </div>
                          <Badge
                            variant={
                              request.status === "approved"
                                ? "default"
                                : request.status === "denied"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* General Requests */}
            <Card>
              <CardHeader>
                <CardTitle>General Team Requests</CardTitle>
                <CardDescription>Requests for more volunteers from all team leaders</CardDescription>
              </CardHeader>
              <CardContent>
                {generalRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No general requests</p>
                ) : (
                  <div className="space-y-4">
                    {generalRequests.map((request: any) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium capitalize">{request.team} Team Request</h4>
                            <p className="text-sm text-gray-600">From {request.adminName}</p>
                            <p className="text-sm mt-2">"{request.message}"</p>
                          </div>
                          <Badge variant="outline">{new Date(request.timestamp).toLocaleDateString()}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
