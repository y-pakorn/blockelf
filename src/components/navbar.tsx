import Link from "next/link"
import { HomeIcon } from "lucide-react"

const Navbar = () => {
  return (
    <nav className="my-2 flex items-center gap-8">
      <h1 className="text-xl font-bold">BLOCKELF</h1>
      <Link href="/">
        <HomeIcon className="size-4" />
      </Link>
    </nav>
  )
}
Navbar.displayName = "Navbar"

export { Navbar }
