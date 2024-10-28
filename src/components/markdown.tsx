import { useTheme } from "next-themes"
import ReactMarkdown, { Options } from "react-markdown"
//import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"

const Markdown = ({
  className,
  ...props
}: Partial<Options> & {
  className?: string
}) => {
  const { resolvedTheme: theme } = useTheme()

  return (
    <ReactMarkdown
      {...props}
      remarkPlugins={[remarkGfm]}
      //rehypePlugins={[rehypeRaw]}
      className={cn(
        "prose-ul:text-dark prose m-0 whitespace-pre-wrap leading-normal text-primary prose-h1:text-3xl prose-h1:leading-none prose-h2:m-0 prose-h2:text-xl prose-h2:font-semibold prose-h2:leading-none prose-p:m-0 prose-p:text-base prose-ul:m-0 prose-ul:list-decimal prose-li:m-0",
        theme === "dark" ? "prose-invert" : "prose",
        className
      )}
      components={{
        img: (props) => (
          <img
            {...props}
            className={cn(
              "aspect-auto max-h-[150px] rounded-md",
              props.className
            )}
          />
        ),
        table: (props) => (
          <div className="my-0 rounded-md border">
            <Table {...props} className="my-0" />
          </div>
        ),
        thead: (props) => <TableHeader {...props} />,
        tbody: (props) => <TableBody {...props} />,
        tfoot: (props) => <TableFooter {...props} />,
        tr: (props) => <TableRow {...props} />,
        th: (props) => <TableHead {...props} />,
        td: (props) => <TableCell {...props} className="py-3" />,
      }}
    />
  )
}
Markdown.displayName = "Markdown"

export { Markdown }
