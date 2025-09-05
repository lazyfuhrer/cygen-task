"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { api } from "../../lib/api"
import { useNavigate, useParams, Link } from "react-router-dom"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/Label"
import { Button } from "../../components/ui/button"
import { useToast } from "../../components/ui/Toast"
import { getDetailedErrorMessage } from "../../lib/error-handler"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function CustomerFormPage() {
  const navigate = useNavigate()
  const { show } = useToast()
  const params = useParams()
  const id = params.id
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; phone?: string }>({})

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    async function load() {
      if (!id) return
      try {
        const c = await api.customers.get(id)
        reset({ name: c.name, email: c.email, phone: c.phone ?? "" })
      } catch (e: unknown) {
        show({ type: "error", message: e instanceof Error ? e.message : 'An error occurred' })
      }
    }
    load()
  }, [id, reset, show])

  const clearFieldError = (field: 'email' | 'phone') => {
    setFieldErrors(prev => ({ ...prev, [field]: undefined }))
    clearErrors(field)
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      // Clear any previous field errors
      setFieldErrors({})
      clearErrors()
      
      if (id) await api.customers.update(id, values)
      else await api.customers.create(values)
      show({ type: "success", message: id ? "Customer updated successfully" : "Customer created successfully" })
      navigate("/customers")
    } catch (e: unknown) {
      const errorDetails = getDetailedErrorMessage(e, 'An error occurred')
      
      // If it's a field-specific error, show it on the field
      if (errorDetails.field) {
        setFieldErrors(prev => ({ ...prev, [errorDetails.field!]: errorDetails.message }))
        setError(errorDetails.field as keyof FormValues, { 
          type: 'manual', 
          message: errorDetails.message 
        })
      } else {
        // Show general error in toast
        show({ type: "error", message: errorDetails.message })
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <Link to="/customers" className="hover:text-foreground transition-colors">
              Customers
            </Link>
            <span>›</span>
            <span className="text-foreground">{id ? "Edit Customer" : "New Customer"}</span>
          </nav>
          <h1 className="page-header gradient-text">{id ? "Edit Customer" : "Add New Customer"}</h1>
          <p className="text-muted-foreground">
            {id
              ? "Update customer information and contact details"
              : "Enter customer information to add them to your database"}
          </p>
        </div>
        <Link to="/customers">
          <Button variant="outline" className="border-border hover:bg-muted bg-transparent">
            ← Back to Customers
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl">
        <div className="gradient-card rounded-lg p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="bg-input border-border focus:ring-ring focus:border-ring"
                  placeholder="Enter customer's full name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{errors.name.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  onFocus={() => clearFieldError('email')}
                  className="bg-input border-border focus:ring-ring focus:border-ring"
                  placeholder="customer@example.com"
                />
                {(errors.email || fieldErrors.email) && (
                  <p className="text-sm text-destructive flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{errors.email?.message || fieldErrors.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone Number
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                onFocus={() => clearFieldError('phone')}
                className="bg-input border-border focus:ring-ring focus:border-ring"
                placeholder="(555) 123-4567"
              />
              {(errors.phone || fieldErrors.phone) && (
                <p className="text-sm text-destructive flex items-center space-x-1">
                  <span>⚠</span>
                  <span>{errors.phone?.message || fieldErrors.phone}</span>
                </p>
              )}
              <p className="text-xs text-muted-foreground">Optional - Include area code for better contact</p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
              <Link to="/customers">
                <Button type="button" variant="outline" className="border-border hover:bg-muted bg-transparent">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-24"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : id ? (
                  "Update Customer"
                ) : (
                  "Create Customer"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
