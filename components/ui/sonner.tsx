"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group relative toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg rounded-xl font-sans",
          description: "group-[.toast]:text-gray-500",
          actionButton:
            "group-[.toast]:bg-gray-900 group-[.toast]:text-gray-50",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500",
            
          closeButton:
            "!absolute !top-[-6px] !right-[-6px] !left-auto !transform-none !m-0 bg-white text-gray-500 border hover:bg-gray-50 transition-colors",
            
          success: "group-[.toaster]:border-green-500 group-[.toaster]:bg-green-50",
          error: "group-[.toaster]:border-red-500 group-[.toaster]:bg-red-50",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }