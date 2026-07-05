'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30',
  secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100',
  ghost: 'hover:bg-white/5 text-zinc-300',
  outline: 'border border-emerald-700 text-emerald-300 hover:bg-emerald-900/20',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
  premium: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-semibold',
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  xl: 'h-14 px-8 text-lg',
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
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97] cursor-pointer',
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
