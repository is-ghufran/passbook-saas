"use client"

import Link from 'next/link'
import { ShieldCheck, Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu"

export function Navbar({ isDashboard = false, userEmail }: { isDashboard?: boolean, userEmail?: string }) {
  return (
    <nav className="sticky top-0 z-50 glass-nav transition-all duration-300 shadow-[0_4px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_4px_30px_rgb(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href={isDashboard ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="p-1.5 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
              FinKul
            </span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {!isDashboard && !userEmail && (
              <>
                <Link href="/pricing" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
                <Link href="/contact" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Contact</Link>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
                <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Log In</Link>
                <Link href="/signup">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-sm shadow-indigo-600/20 transition-all hover:shadow-indigo-600/40 hover:-translate-y-0.5">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            {!isDashboard && userEmail && (
              <>
                <Link href="/pricing" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
                <Link href="/contact" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Contact</Link>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
                <Link href="/dashboard">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-sm shadow-indigo-600/20 transition-all hover:shadow-indigo-600/40 hover:-translate-y-0.5">
                    Dashboard
                  </Button>
                </Link>
              </>
            )}
            {userEmail && (
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar className="w-9 h-9 border border-indigo-200 dark:border-indigo-900 cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 transition-all dark:hover:ring-offset-slate-950">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-medium">
                        {userEmail.substring(0,2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-card w-56 border-none bg-white/80 dark:bg-slate-900/80">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">Account</p>
                          <p className="text-xs leading-none text-slate-500 dark:text-slate-400">{userEmail}</p>
                        </div>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                    <Link href="/dashboard"><DropdownMenuItem className="cursor-pointer">Analyzer</DropdownMenuItem></Link>
                    <Link href="/history"><DropdownMenuItem className="cursor-pointer">History</DropdownMenuItem></Link>
                    <Link href="/billing"><DropdownMenuItem className="cursor-pointer">Billing</DropdownMenuItem></Link>
                    <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                    <form action="/api/auth/signout" method="post" className="w-full">
                      <button type="submit" className="w-full text-left">
                        <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30">
                          Sign out
                        </DropdownMenuItem>
                      </button>
                    </form>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile Nav */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger className="inline-flex items-center justify-center rounded-full w-10 h-10 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none">
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </SheetTrigger>
              <SheetContent side="right" className="glass-card w-[300px] border-l border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-6 mt-8">
                  {isDashboard ? (
                    <>
                      <Link href="/dashboard" className="text-lg font-medium text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">Analyzer</Link>
                      <Link href="/history" className="text-lg font-medium text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">History</Link>
                      <Link href="/billing" className="text-lg font-medium text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">Billing</Link>
                      <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
                      <form action="/api/auth/signout" method="post" className="w-full">
                        <button type="submit" className="text-lg font-medium text-red-600 dark:text-red-400 hover:text-red-700 transition-colors">
                          Sign out
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Link href="/pricing" className="text-lg font-medium text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">Pricing</Link>
                      <Link href="/contact" className="text-lg font-medium text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">Contact</Link>
                      <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
                      {userEmail ? (
                        <>
                          <Link href="/dashboard">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full py-6 text-lg shadow-md shadow-indigo-600/20">Go to Dashboard</Button>
                          </Link>
                          <form action="/api/auth/signout" method="post" className="w-full">
                            <button type="submit" className="text-lg font-medium text-red-600 dark:text-red-400 hover:text-red-700 transition-colors">
                              Sign out
                            </button>
                          </form>
                        </>
                      ) : (
                        <>
                          <Link href="/login" className="text-lg font-medium text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">Log In</Link>
                          <Link href="/signup">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full py-6 text-lg shadow-md shadow-indigo-600/20">Sign Up</Button>
                          </Link>
                        </>
                      )}
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
