"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Calendar, LogOut, User, Clock } from "lucide-react"

const TEAMS = ["usher", "greeter", "prayer", "music", "security", "strike", "hospitality"]

export default function UserDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [availabilityData, setAvailabilityData] = useState<any>({})
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/signin")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "user") {
      router.push("/")
      return
    }

    setUser(parsedUser)

    // Set default to current month
    const now = new Date()
    setSelectedMonth((now.getMonth() + 1).toString())
    setSelectedYear(now.getFullYear().toString())
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const getMonthOptions = () => {
    const months = []
    const now = new Date()

    for (let i = 0; i < 4; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
      months.push({
        value: `${date.getMonth() + 1}-${date.getFullYear()}`,
        label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      })
    }

    return months
  }

  const getSundaysInMonth = (month: number, year: number) => {
    const sundays = []
    const date = new Date(year, month - 1, 1)

    // Find first Sunday
    while (date.getDay() !== 0) {
      date.setDate(date.getDate() + 1)
    }

    // Get all Sundays in the month
    while (date.getMonth() === month - 1) {
      sundays.push(new Date(date))
      date.setDate(date.getDate() + 7)
    }

    return sundays
  }

  const handleAvailabilitySubmit = (sundayDate: string, primaryTeams: string[], secondaryTeams: string[]) => {
    const key = `${selectedMonth}-${selectedYear}`
    setAvailabilityData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [sundayDate]: { primaryTeams, secondaryTeams },
      },
    }))
  }

  if (!user) return <div>Loading...</div>

  const monthOptions = getMonthOptions()
  const currentMonth = selectedMonth ? Number.parseInt(selectedMonth.split("-")[0]) : new Date().getMonth() + 1
  const currentYear = selectedYear
    ? Number.parseInt(selectedYear.split("-")[1] || selectedYear)
    : new Date().getFullYear()
  const sundays = getSundaysInMonth(currentMonth, currentYear)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SCC Team Scheduler</h1>
                <p className="text-sm text-gray-600">
                  Welcome, {user.firstName} {user.lastName}
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Primary Teams:</p>
                  <p className="text-sm text-gray-600">
                    {user.primaryTeams?.length
                      ? user.primaryTeams.map((t: string) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")
                      : "None"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Secondary Teams:</p>
                  <p className="text-sm text-gray-600">
                    {user.secondaryTeams?.length
                      ? user.secondaryTeams.map((t: string) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")
                      : "None"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Month Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Month to View/Edit</CardTitle>
              <CardDescription>Choose a month to view your availability or add new availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center">
                <Select
                  value={`${selectedMonth}-${selectedYear}`}
                  onValueChange={(value) => {
                    const [month, year] = value.split("-")
                    setSelectedMonth(month)
                    setSelectedYear(year)
                  }}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => setShowAvailabilityForm(!showAvailabilityForm)}>
                  {showAvailabilityForm ? "Hide" : "Add"} Availability
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Availability Calendar */}
          {selectedMonth && selectedYear && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  {monthOptions.find((m) => m.value === `${selectedMonth}-${selectedYear}`)?.label} - Sundays
                </CardTitle>
                <CardDescription>Your availability for each Sunday</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sundays.map((sunday, index) => {
                    const dateKey = sunday.toISOString().split("T")[0]
                    const monthKey = `${selectedMonth}-${selectedYear}`
                    const availability = availabilityData[monthKey]?.[dateKey]

                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">
                              {sunday.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                              })}
                            </h4>
                          </div>
                        </div>

                        {availability ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-green-700">Primary Teams:</p>
                              <p className="text-sm text-green-600">
                                {availability.primaryTeams.length
                                  ? availability.primaryTeams
                                      .map((t: string) => t.charAt(0).toUpperCase() + t.slice(1))
                                      .join(", ")
                                  : "None"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-700">Secondary Teams:</p>
                              <p className="text-sm text-blue-600">
                                {availability.secondaryTeams.length
                                  ? availability.secondaryTeams
                                      .map((t: string) => t.charAt(0).toUpperCase() + t.slice(1))
                                      .join(", ")
                                  : "None"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No availability set</p>
                        )}

                        {showAvailabilityForm && (
                          <AvailabilityForm
                            sunday={sunday}
                            onSubmit={(primary, secondary) => handleAvailabilitySubmit(dateKey, primary, secondary)}
                            initialData={availability}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

function AvailabilityForm({ sunday, onSubmit, initialData }: any) {
  const [primaryTeams, setPrimaryTeams] = useState<string[]>(initialData?.primaryTeams || [])
  const [secondaryTeams, setSecondaryTeams] = useState<string[]>(initialData?.secondaryTeams || [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation: max 2 primary OR 1 primary + 1 secondary
    if (primaryTeams.length > 2 || (primaryTeams.length > 1 && secondaryTeams.length > 0)) {
      alert("You can select up to 2 primary teams OR 1 primary + 1 secondary team")
      return
    }

    onSubmit(primaryTeams, secondaryTeams)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h5 className="font-medium mb-3">Set Availability for {sunday.toLocaleDateString()}</h5>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="text-sm font-medium">Primary Teams (Max 2)</Label>
          <div className="mt-2 space-y-2">
            {TEAMS.map((team) => (
              <div key={team} className="flex items-center space-x-2">
                <Checkbox
                  id={`primary-${team}`}
                  checked={primaryTeams.includes(team)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setPrimaryTeams((prev) => [...prev, team])
                    } else {
                      setPrimaryTeams((prev) => prev.filter((t) => t !== team))
                    }
                  }}
                />
                <Label htmlFor={`primary-${team}`} className="text-sm capitalize">
                  {team}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Secondary Teams</Label>
          <div className="mt-2 space-y-2">
            {TEAMS.map((team) => (
              <div key={team} className="flex items-center space-x-2">
                <Checkbox
                  id={`secondary-${team}`}
                  checked={secondaryTeams.includes(team)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSecondaryTeams((prev) => [...prev, team])
                    } else {
                      setSecondaryTeams((prev) => prev.filter((t) => t !== team))
                    }
                  }}
                />
                <Label htmlFor={`secondary-${team}`} className="text-sm capitalize">
                  {team}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="submit" size="sm">
          Save Availability
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setPrimaryTeams([])
            setSecondaryTeams([])
            onSubmit([], [])
          }}
        >
          Clear
        </Button>
      </div>
    </form>
  )
}
