"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

const TEAMS = ["usher", "greeter", "prayer", "music", "security", "strike", "hospitality"]

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthday: "",
    primaryTeams: [] as string[],
    secondaryTeams: [] as string[],
  })
  const [loading, setLoading] = useState(false)

  const handleTeamChange = (team: string, type: "primary" | "secondary", checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [`${type}Teams`]: checked ? [...prev[`${type}Teams`], team] : prev[`${type}Teams`].filter((t) => t !== team),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Store user data in localStorage for demo
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        ...formData,
        id: Date.now(),
        role: "user",
      }),
    )

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Sign Up - SCC Team Scheduler</CardTitle>
          <CardDescription>Create your account to join church teams</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData((prev) => ({ ...prev, birthday: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Primary Teams</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Select all teams you want to serve on primarily (you can select multiple)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {TEAMS.map((team) => (
                    <div key={team} className="flex items-center space-x-2">
                      <Checkbox
                        id={`primary-${team}`}
                        checked={formData.primaryTeams.includes(team)}
                        onCheckedChange={(checked) => handleTeamChange(team, "primary", checked as boolean)}
                      />
                      <Label htmlFor={`primary-${team}`} className="capitalize">
                        {team}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Secondary Teams</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Select all teams you can help with occasionally (you can select multiple)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {TEAMS.map((team) => (
                    <div key={team} className="flex items-center space-x-2">
                      <Checkbox
                        id={`secondary-${team}`}
                        checked={formData.secondaryTeams.includes(team)}
                        onCheckedChange={(checked) => handleTeamChange(team, "secondary", checked as boolean)}
                      />
                      <Label htmlFor={`secondary-${team}`} className="capitalize">
                        {team}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>

            <div className="text-center">
              <Link href="/signin" className="text-sm text-blue-600 hover:underline">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
