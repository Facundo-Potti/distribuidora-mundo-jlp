import Link from "next/link"
import Image from "next/image"

export function Logo({ className }: { className?: string }) {
  const isDark = className?.includes("text-white") || false
  const textColor = isDark ? "text-white" : "text-black"
  const subTextColor = isDark ? "text-gray-300" : "text-gray-600"
  
  return (
    <Link href="/" className={`flex items-center space-x-3 ${className || ""} group transition-opacity hover:opacity-90`}>
      <div className="relative flex-shrink-0">
        <Image
          src="/logo.svg"
          alt="Distribuidora MUNDO JLP"
          width={48}
          height={48}
          className="w-12 h-12"
          priority
        />
      </div>
      <div className="flex flex-col">
        <span className={`text-xs font-normal ${subTextColor} leading-tight`}>Distribuidora</span>
        <span className={`text-lg font-bold ${textColor} leading-tight`}>MUNDO JLP</span>
      </div>
    </Link>
  )
}

