import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  link?: string,
  pageName?: string
  className?: string
}

/**
 * A reusable component for creating a persistent "Back to X" link.
 *
 * @param {BackToGivenPageProps} props - Properties of the component.
 * @param {string} props.link - The link to navigate to.
 * @param {string} props.pageName - Page's name to navigate to.
 * @param {string} props.className - Additional classes.
 */
export default function BackToGivenPage({
  link = "/",
  pageName = "home page",
  className = ""
}: Props) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "text-gray-300 hover:text-white p-0 absolute -top-12 left-0",
        className
      )}
    >
      <Link href={link} className="flex items-center p-2 rounded-lg">
        <ArrowLeft className="w-5 h-5 mr-1" />
        Back to {pageName.toLowerCase()}
      </Link>
    </Button>
  )
}
