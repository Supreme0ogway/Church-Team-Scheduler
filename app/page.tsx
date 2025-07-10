import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">SCC Team Scheduler</h1>
          <p className="text-gray-600">Manage your church team scheduling</p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>New User</CardTitle>
              <CardDescription>Create your account to join teams</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/signup">
                <Button className="w-full">Sign Up</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing User</CardTitle>
              <CardDescription>Sign in to manage your availability</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/signin">
                <Button variant="outline" className="w-full bg-transparent">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Leader</CardTitle>
              <CardDescription>Admin access for team management</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/signin">
                <Button variant="secondary" className="w-full">
                  Admin Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>
            <strong>Test Accounts:</strong>
          </p>
          <p>User: john.doe@test.com / password123</p>
          <p>Admin: admin@scc.com / admin123</p>
        </div>
      </div>
    </div>
  )
}
