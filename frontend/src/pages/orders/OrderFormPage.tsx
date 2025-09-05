"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { api } from "../../lib/api"
import type { Customer, Product } from "../../lib/api"
import { useNavigate, Link } from "react-router-dom"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/Label"
import { Button } from "../../components/ui/button"
import Select from "../../components/ui/Select"
import { useToast } from "../../components/ui/Toast"

const itemSchema = z.object({
  productId: z.string().uuid("Choose product"),
  quantity: z.number().int().positive("Qty > 0"),
  price: z.number().positive("Price > 0"),
})

const schema = z.object({
  customerId: z.string().uuid("Choose customer"),
  items: z.array(itemSchema).min(1, "Add at least one item"),
})

type FormValues = z.infer<typeof schema>

export default function OrderFormPage() {
  const navigate = useNavigate()
  const { show } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { items: [{ productId: "", quantity: 1, price: 0 }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })
  const watchedItems = watch("items")

  useEffect(() => {
    async function load() {
      try {
        const [cs, ps] = await Promise.all([api.customers.list(), api.products.list()])
        setCustomers(cs)
        setProducts(ps)
      } catch (e: unknown) {
        show({ type: "error", message: e instanceof Error ? e.message : "An error occurred" })
      }
    }
    load()
  }, [show])

  // Listen for data changes from sidebar
  useEffect(() => {
    const handleDataChange = async () => {
      setIsRefreshing(true)
      try {
        const [cs, ps] = await Promise.all([api.customers.list(), api.products.list()])
        setCustomers(cs)
        setProducts(ps)
      } catch (e: unknown) {
        show({ type: "error", message: e instanceof Error ? e.message : "An error occurred" })
      }
      // Brief delay to show refresh indicator
      setTimeout(() => setIsRefreshing(false), 500)
    }

    window.addEventListener('dataChanged', handleDataChange)
    return () => window.removeEventListener('dataChanged', handleDataChange)
  }, [show])

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const orderTotal = watchedItems.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (Number(item.quantity) || 0)
  }, 0)

  const onSubmit = handleSubmit(async (values: FormValues) => {
    try {
      await api.orders.create(values)
      show({ type: "success", message: "Order created successfully" })
      navigate("/orders")
    } catch (e: unknown) {
      show({ type: "error", message: e instanceof Error ? e.message : "An error occurred" })
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <Link to="/orders" className="hover:text-foreground transition-colors">
              Orders
            </Link>
            <span>›</span>
            <span className="text-foreground">New Order</span>
          </nav>
          <div className="flex items-center space-x-3">
            <h1 className="page-header">Create New Order</h1>
            {isRefreshing && (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <p className="text-muted-foreground">Add products and customer information to create a new order</p>
        </div>
        <Link to="/orders">
          <Button variant="outline" className="border-border hover:bg-muted bg-transparent">
            ← Back to Orders
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="section-header">Customer Information</h3>
            <div className="space-y-2">
              <Label htmlFor="customer" className="text-sm font-medium text-foreground">
                Select Customer *
              </Label>
              <Select
                id="customer"
                {...register("customerId")}
                className="bg-input border-border focus:ring-ring focus:border-ring"
              >
                <option value="">Choose a customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </Select>
              {errors.customerId && (
                <p className="text-sm text-destructive flex items-center space-x-1">
                  <span>⚠</span>
                  <span>{errors.customerId.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-header mb-0">Order Items</h3>
              <Button
                type="button"
                onClick={() => append({ productId: "", quantity: 1, price: 0 })}
                variant="outline"
                className="border-border hover:bg-muted bg-transparent"
              >
                + Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="bg-muted/30 border border-border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Product</Label>
                      <Select
                        {...register(`items.${index}.productId` as const)}
                        onChange={(e) => {
                          const pid = e.target.value
                          const p = productById.get(pid)
                          if (p) setValue(`items.${index}.price`, Number(p.price))
                        }}
                        className="bg-input border-border"
                      >
                        <option value="">Select product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${Number(p.price).toFixed(2)})
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                        className="bg-input border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...register(`items.${index}.price` as const, { valueAsNumber: true })}
                        className="bg-input border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Actions</Label>
                      <Button
                        type="button"
                        onClick={() => remove(index)}
                        variant="outline"
                        className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        disabled={fields.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  {errors.items?.[index] && (
                    <div className="mt-2 text-sm text-destructive">
                      {Object.entries(errors.items[index] || {}).map(([key, error]) => (
                        <p key={key} className="flex items-center space-x-1">
                          <span>⚠</span>
                          <span>{typeof error === 'object' && error && 'message' in error ? error.message : String(error)}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {typeof errors.items?.message === "string" && (
                <p className="text-sm text-destructive flex items-center space-x-1">
                  <span>⚠</span>
                  <span>{errors.items?.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-medium text-foreground">Order Total</p>
                <p className="text-sm text-muted-foreground">{fields.length} item(s)</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">${orderTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
            <Link to="/orders">
              <Button type="button" variant="outline" className="border-border hover:bg-muted bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-32"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Order"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
