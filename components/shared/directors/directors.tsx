"use client"

import { useState } from "react"
import { easeInOut, motion } from "framer-motion"

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

import {
  Calendar, Pencil, PlusIcon,
  Search, Trash, User
} from "lucide-react"

import DirectorFormModal from "./director-form-modal"
import DeleteDirectorModal from "./delete-director-modal"

import BackToGivenPage from "../back-to-given-page/back-to-given-page"

type Props = {
  directors: Director[],
  userId: string,
  isAdmin: boolean
}

/**
 * Renders a table where users can read the full list of all directors.
 */
export default function Directors(
  { directors, userId, isAdmin }: Props
) {
  const [openAddDirectorModal, setOpenAddDirectorModal] = useState(false)
  const [openEditDirectorModal, setOpenEditDirectorModal] = useState(false)
  const [openRemoveDirectorModal, setOpenRemoveDirectorModal] = useState(false)
  const [selectedDirector, setSelectedDirector] = useState<Director | undefined>(undefined)

  const [searchTerm, setSearchTerm] = useState("")

  const filteredDirectors = directors.filter((director: Director) =>
    director.name.toLowerCase().includes(searchTerm.toLowerCase())
    || director.birthYear?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    || director.addedByName?.toLowerCase().includes(searchTerm.toLowerCase())
    || director.createdAt?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <div className="h-[calc(100vh-96px)] grid justify-center pt-48 lg:pt-40 px-4 sm:px-12">
        <motion.div
          className="w-[90vw] sm:w-full lg:w-[60vw] relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeInOut }}  
        >
          <BackToGivenPage />

          <Card className="shadow-2xl bg-input/30 backdrop-blur-[3px] border border-input w-[90vw] sm:w-full lg:w-[60vw] max-h-[45rem] overflow-y-auto">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-3xl font-extrabold tracking-tight">
                Directors
              </CardTitle>

              <Button
                variant="primary"
                className="w-8 h-8 rounded-2xl"
                onClick={() => setOpenAddDirectorModal(true)}
              >
                <PlusIcon className="w-8 h-8 text-white" />
              </Button>
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

                    {/* Need this for the edit/remove functionality */}
                    <TableHead />
                  </TableRow>
                </TableHeader>

                {filteredDirectors.length === 0 && (
                  <TableBody>
                    <TableRow className="hover:bg-transparent">
                      <TableCell>
                        <h2 className="text-xl font-semibold ml-2 mt-8">
                          No directors found
                        </h2>
                        <p className="text-base text-gray-400 ml-2 mb-4">
                          Try adjusting your search criteria!
                        </p>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
                    
                <TableBody>
                  {filteredDirectors.length > 0 && filteredDirectors.map((director: Director) => (
                    <TableRow
                      key={director.id}
                      className="hover:bg-primaryColor/5 transition-colors group relative"
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
                          {director.addedByUser.id === userId && " (You)"}
                        </div>
                      </TableCell>
                      
                      {/* Added at */}
                      <TableCell>
                        {new Date(director.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        {(isAdmin || director.addedByUser.id === userId) && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 flex gap-2">
                            <Button
                              variant="outline"
                              className="w-4 md:w-fit h-6 rounded-2xl"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedDirector(director)
                                setOpenEditDirectorModal(true)
                              }}
                            >
                              <Pencil className="w-2 h-2 text-white" />
                            </Button>

                            <Button
                              variant="destructive"
                              className="w-4 md:w-fit h-6 rounded-2xl hover:bg-red-500! transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedDirector(director)
                                setOpenRemoveDirectorModal(true)
                              }}
                            >
                              <Trash className="w-2 h-2 text-white" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    
      <DirectorFormModal
        open={openAddDirectorModal}
        onOpenChange={setOpenAddDirectorModal}
        mode="add"
        directorToEdit={selectedDirector}
      />

      <DirectorFormModal
        open={openEditDirectorModal}
        onOpenChange={setOpenEditDirectorModal}
        mode="edit"
        directorToEdit={selectedDirector}
      />

      <DeleteDirectorModal
        open={openRemoveDirectorModal}
        onOpenChange={setOpenRemoveDirectorModal}
        directorToDelete={selectedDirector}
      />
    </>
  )
}
