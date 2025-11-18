import Link from "next/link"

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className || ""}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
        <span className="text-xl font-bold text-white">DM</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-normal text-gray-600">Distribuidora</span>
        <span className="text-lg font-bold text-black">MUNDO JLP</span>
      </div>
    </Link>
  )
}

