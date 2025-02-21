// types.d.ts
import * as React from 'react'

declare module 'cmdk' {
  export interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
    label?: string
    shouldFilter?: boolean
    filter?(value: string, search: string): boolean
    value?: string
    onValueChange?(value: string): void
    loop?: boolean
    children?: React.ReactNode
  }

  export const Command: React.ForwardRefExoticComponent
    CommandProps & React.RefAttributes<HTMLDivElement>
   & {
    List: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>
    // Item: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>
    // Input: React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>
    // Group: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>
    // Separator: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>
    // Empty: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>
    // Loading: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>
    // Add any other components that are part of cmdk
  }
}