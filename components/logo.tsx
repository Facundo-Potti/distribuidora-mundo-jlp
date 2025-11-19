import Link from "next/link"
import Image from "next/image"

export function Logo({ className }: { className?: string }) {
  const isDark = className?.includes("text-white") || false
  const textColor = isDark ? "text-white" : "text-black"
  const subTextColor = isDark ? "text-gray-300" : "text-gray-600"
  
  return (
    <Link href="/" className={`flex items-center space-x-5 ${className || ""} group transition-opacity hover:opacity-90`}>
      <div className="relative flex-shrink-0">
        <Image
          src="/logo-original.png"
          alt="Distribuidora MUNDO JLP"
          width={120}
          height={120}
          className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain"
          priority
        />
      </div>
      <div className="flex flex-col">
        <span className={`text-lg md:text-xl font-normal ${subTextColor} leading-tight`}>Distribuidora</span>
        <span className={`text-2xl md:text-3xl lg:text-4xl font-bold ${textColor} leading-tight`}>MUNDO JLP</span>
      </div>
    </Link>
  )
}

