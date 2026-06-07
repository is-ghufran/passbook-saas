"use client"

export function BackgroundMesh() {
  return (
    <div className="fixed inset-0 -z-50 h-full w-full bg-white dark:bg-black overflow-hidden pointer-events-none">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white dark:from-indigo-950/30 dark:via-black dark:to-black"></div>
      
      {/* Top Right Blob */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] rounded-full bg-indigo-400/20 dark:bg-indigo-900/20 blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-pulse duration-[10000ms]"></div>
      
      {/* Bottom Left Blob */}
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] rounded-full bg-purple-400/20 dark:bg-purple-900/20 blur-[100px] mix-blend-multiply dark:mix-blend-lighten animate-pulse duration-[7000ms] delay-1000"></div>
    </div>
  )
}
