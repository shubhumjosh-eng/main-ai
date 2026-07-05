'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 active:scale-[0.97]',
  secondary: 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-100 border border-zinc-700/50 active:scale-[0.97]',
  ghost: 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200 active:scale-[0.97]',
  outline: 'border border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/20 hover:border-emerald-600/50 active:scale-[0.97]',
  danger: 'bg-red-600/90 hover:bg-red-500/90 text-white shadow-lg shadow-red-900/30 active:scale-[0.97]',
  premium: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-semibold hover:from-amber-400 hover:via-yellow-300 hover:to-amber-400 active:scale-[0.97] shadow-lg shadow-amber-900/30',
}

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-xl',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-12 px-6 text-base rounded-xl',
  xl: 'h-14 px-8 text-lg rounded-xl',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export { Button }
