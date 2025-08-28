import { Inter } from 'next/font/google'
import '../globals.css'
import React from 'react'

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen shadow-lg">
      {children}
    </div>
  )
}
