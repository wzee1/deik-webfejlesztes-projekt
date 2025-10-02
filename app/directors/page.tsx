import { getDirectors } from "@/actions/directors.actions"
import Directors from "@/components/shared/directors/directors"

import { isAuthenticated } from "@/lib/auth/auth-functions"
import { redirect } from "next/navigation"

export default async function DirectorsPage() {
  const valid = await isAuthenticated()
  if (!valid) redirect("/login?returnTo=directors")

  const result = await getDirectors()

  // Uncomment this line to trigger error state:
  //const result = {
  //  success: false,
  //  data: null
  //}

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen grid place-items-center -translate-y-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-2">
            Unexpected error occurred!
          </h1>
          
          <p className="text-lg">
            Try refreshing the page or try again later!  
          </p>
        </div>
      </div>
    )
  }

  const directors = result.data
  
  return <Directors directors={directors} />
}

