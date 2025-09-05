"use client"

import { useEffect } from "react"
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
  name: z.string().min(1, "Product name is required"),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().nonnegative("Stock must be 0 or greater"),
})

type FormValues = z.infer<typeof schema>

export default function ProductFormPage() {
  const navigate = useNavigate()
  const { show } = useToast()
  const params = useParams()
  const id = params.id

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const watchedValues = watch()
  const estimatedValue = (watchedValues.price || 0) * (watchedValues.stock || 0)

  useEffect(() => {
    async function load() {
      if (!id) return
      try {
        const p = await api.products.get(id)
        reset({ name: p.name, price: Number(p.price), stock: p.stock })
      } catch (e: unknown) {
        show({ type: "error", message: e instanceof Error ? e.message : 'An error occurred' })
      }
    }
    load()
  }, [id, reset, show])

  const onSubmit = handleSubmit(async (values: FormValues) => {
    try {
      // Send price as number, not string
      const productData = { ...values }
      if (id) await api.products.update(id, productData)
      else await api.products.create(productData)
      show({ type: "success", message: id ? "Product updated successfully" : "Product created successfully" })
      navigate("/products")
    } catch (e: unknown) {
      const errorDetails = getDetailedErrorMessage(e, 'An error occurred')
      show({ type: "error", message: errorDetails.message })
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <Link to="/products" className="hover:text-foreground transition-colors">
              Products
            </Link>
            <span>›</span>
            <span className="text-foreground">{id ? "Edit Product" : "New Product"}</span>
          </nav>
          <h1 className="page-header gradient-text">{id ? "Edit Product" : "Add New Product"}</h1>
          <p className="text-muted-foreground">
            {id ? "Update product information and inventory details" : "Enter product details to add to your catalog"}
          </p>
        </div>
        <Link to="/products">
          <Button variant="outline" className="border-border hover:bg-muted bg-transparent">
            ← Back to Products
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Product Information */}
          <div className="gradient-card rounded-lg p-6">
            <h3 className="section-header">Product Information</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="bg-input border-border focus:ring-ring focus:border-ring"
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{errors.name.message}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium text-foreground">
                    Unit Price *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("price", { valueAsNumber: true })}
                      className="bg-input border-border focus:ring-ring focus:border-ring pl-8"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-destructive flex items-center space-x-1">
                      <span>⚠</span>
                      <span>{errors.price.message}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm font-medium text-foreground">
                    Stock Quantity *
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    {...register("stock", { valueAsNumber: true })}
                    className="bg-input border-border focus:ring-ring focus:border-ring"
                    placeholder="0"
                  />
                  {errors.stock && (
                    <p className="text-sm text-destructive flex items-center space-x-1">
                      <span>⚠</span>
                      <span>{errors.stock.message}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Current inventory level</p>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Summary */}
          {(watchedValues.price > 0 || watchedValues.stock > 0) && (
            <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-6">
              <h3 className="section-header">Inventory Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Unit Price</p>
                  <p className="text-xl font-bold text-secondary">${(watchedValues.price || 0).toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Stock Quantity</p>
                  <p className="text-xl font-bold text-secondary">{watchedValues.stock || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-xl font-bold text-secondary">${estimatedValue.toFixed(2)}</p>
                </div>
              </div>

              {watchedValues.stock !== undefined && (
                <div className="mt-4 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      watchedValues.stock === 0
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : watchedValues.stock < 10
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          : "bg-green-100 text-green-800 border border-green-200"
                    }`}
                  >
                    {watchedValues.stock === 0
                      ? "Out of Stock"
                      : watchedValues.stock < 10
                        ? "Low Stock Warning"
                        : "Stock Level Good"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
            <Link to="/products">
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
                  <span>Saving...</span>
                </div>
              ) : id ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
