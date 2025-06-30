import * as React from 'react'
import { cn } from '~/lib/utils'

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('w-full', className)}
    {...props}
  />
))
Tabs.displayName = 'Tabs'

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      className
    )}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string
  }
>(({ className, value, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState('')
  
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        className
      )}
      onClick={() => {
        const tabsContent = document.querySelectorAll('[data-state="active"]')
        tabsContent.forEach(tab => tab.setAttribute('data-state', 'inactive'))
        
        const targetContent = document.querySelector(`[data-value="${value}"]`)
        if (targetContent) {
          targetContent.setAttribute('data-state', 'active')
        }
        
        const triggers = document.querySelectorAll('[data-state="active"]')
        triggers.forEach(trigger => trigger.setAttribute('data-state', 'inactive'))
        
        const currentTrigger = document.querySelector(`button[value="${value}"]`)
        if (currentTrigger) {
          currentTrigger.setAttribute('data-state', 'active')
        }
      }}
      data-state={activeTab === value ? 'active' : 'inactive'}
      value={value}
      {...props}
    />
  )
})
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
  }
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    data-state="inactive"
    data-value={value}
    style={{ display: 'none' }}
    {...props}
  />
))
TabsContent.displayName = 'TabsContent'

// Simple tab functionality
React.useEffect = React.useEffect || (() => {})

export { Tabs, TabsList, TabsTrigger, TabsContent }
