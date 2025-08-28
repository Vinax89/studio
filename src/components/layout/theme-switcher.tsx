
'use client'

import * as React from 'react'
import { Icon } from '@/components/ui/icon'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        aria-label="Use light theme"
        onClick={() => setTheme('light')}
      >
        <Icon name="sun" size={16} />
      </Button>
      <Button
        variant="ghost"
        aria-label="Use dark theme"
        onClick={() => setTheme('dark')}
      >
        <Icon name="moon" size={16} />
      </Button>
    </div>
  )
}
