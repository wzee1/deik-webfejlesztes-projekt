"use client"

import { useState } from "react"
import Link from "next/link"

import { Director } from "@/actions/directors.actions"

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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { ArrowLeft, Calendar, PersonStanding, Search, User } from "lucide-react"

export default function Directors(
  { directors }: { directors: Director[] }
) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDirectors = directors.filter((director: Director) =>
    director.name.toLowerCase().includes(searchTerm.toLowerCase())
    || director.birthYear?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    || director.addedByName?.toLowerCase().includes(searchTerm.toLowerCase())
    || director.createdAt?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-96px)] grid justify-center lg:mt-24 sm:px-12">
      <div className="w-[90vw] sm:w-full lg:w-[60vw]">
        <Button variant="ghost" className="text-gray-300 hover:text-white p-0 mb-2">
          <Link href="/" className="flex items-center p-2 rounded-lg">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to home page
          </Link>
        </Button>

        <Card className="shadow-2xl bg-input/30 border border-input w-[90vw] sm:w-full lg:w-[60vw] max-h-[45rem] overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              Directors
            </CardTitle>
          </CardHeader>

          <div className="relative px-6">
            <Search className="absolute left-9 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, birth year, by who added the director or when..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-36 h-12 text-base"
            />

            {searchTerm && (
              <p className="absolute right-10 top-[2.5px] text-sm text-gray-200 mt-3">
                Found {filteredDirectors.length} {filteredDirectors.length === 1 ? "director" : "directors"}
              </p>
            )}
          </div>

          <CardContent className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="rounded-full bg-primaryColor/10 hover:bg-primaryColor/20  transition-colors">
                  {["Name", "Birth year", "Added by", "Added at"].map(t => (
                    <TableHead className="text-lg font-semibold" key={t}>
                      {t}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              {filteredDirectors.length === 0 && (
                <TableBody>
                  <TableRow className="hover:bg-transparent">
                    <h2 className="text-xl font-semibold ml-2 mt-8">
                      No directors found
                    </h2>
                    <p className="text-base text-gray-400 ml-2 mb-8">
                      Try adjusting your search criteria!
                    </p>
                  </TableRow>
                </TableBody>
              )}
                  
              <TableBody>
                {filteredDirectors.length > 1 && filteredDirectors.map((director: Director) => (
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
    </div>
  )
}
