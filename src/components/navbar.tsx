import Link from "next/link"
import { HomeIcon } from "lucide-react"

const Navbar = () => {
  return (
    <nav className="my-2 flex flex-col items-center gap-8 p-4">
      <h1 className="text-xl font-bold">BlockElf</h1>
      <Link href="/">
        <HomeIcon className="size-4" />
      </Link>
    </nav>
  )
}
Navbar.displayName = "Navbar"

export { Navbar }
