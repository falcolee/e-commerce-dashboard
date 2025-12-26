"use client"

import { useState } from "react"
import { SignupForm } from "./signup-form"
import { toast } from "sonner" // or your preferred toast library

// Example type that matches your JSON structure
interface SignupData {
  email: string
  password: string
  confirmPassword: string
}

export function SignupPageExample() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (data: SignupData) => {
    setIsLoading(true)

    try {
      // Simulate API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          // You can add other fields as needed
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Signup failed')
      }

      const result = await response.json()
      console.log('Signup successful:', result)

      // Show success message
      toast.success('Account created successfully!')

      // Handle successful signup (e.g., redirect to login)
      // router.push('/login')

    } catch (error) {
      console.error('Signup error:', error)
      // Show error message
      toast.error(error instanceof Error ? error.message : 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <SignupForm
        onSubmit={handleSignup}
        isLoading={isLoading}
        title="Create an account"
        description="Enter your email and password to create your account"
      />
    </div>
  )
}