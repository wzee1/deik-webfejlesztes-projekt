import { getDirectors, Director } from "@/actions/directors.actions"

import {
  Card, CardHeader,
  CardTitle, CardContent
} from "@/components/ui/card"
import {
  Table, TableBody,
  TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

import { Calendar, User } from "lucide-react"

export default async function DirectorsPage() {
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

  return (
    <div className="min-h-screen grid place-items-center -translate-y-24 sm:px-12">
      <Card className="bg-card shadow-2xl border border-primaryColor/30 w-[90vw] sm:w-full lg:w-[60vw]">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-primaryColor">
            Directors
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-primaryColor/10 hover:bg-primaryColor/20  transition-colors">
                {["Name", "Birth year", "Added by", "Added at"].map(t => (
                  <TableHead className="text-lg font-semibold" id={t}>
                    {t}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {directors.map((director: Director) => (
                <TableRow
                  key={director.id}
                  className="hover:bg-primaryColor/5 transition-colors group"
                >
                  {/* Name */}
                  <TableCell className="text-gray-200 group-hover:text-white transition-colors">
                    {director.name}
                  </TableCell>
                  
                  {/* Birth year */}
                  <TableCell className="text-white">
                    <Badge
                      variant="secondary"
                      className="bg-secondaryColor/80 hover:bg-secondaryColor transition-colors font-bold"
                    >
                      <Calendar className="w-4 h-4 mr-1 stroke-white" />
                      {director.birthYear || "N/A"}
                    </Badge>
                  </TableCell>
                  
                  {/* Added by */}
                  <TableCell>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {director.addedByName}
                    </div>
                  </TableCell>
                  
                  {/* Added at */}
                  <TableCell>
                    {new Date(director.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
