"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { api } from "../../lib/api"
import type { Order } from "../../lib/api"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { useToast } from "../../components/ui/Toast"

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { show } = useToast()

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await api.orders.get(id)
      setOrder(data)
    } catch (e: unknown) {
      show({ type: "error", message: e instanceof Error ? e.message : 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }, [id, show])

  useEffect(() => {
    load()
  }, [id, load])

  // Listen for data changes from sidebar
  useEffect(() => {
    const handleDataChange = async () => {
      setIsRefreshing(true)
      await load()
      // Brief delay to show refresh indicator
      setTimeout(() => setIsRefreshing(false), 500)
    }

    window.addEventListener('dataChanged', handleDataChange)
    return () => window.removeEventListener('dataChanged', handleDataChange)
  }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Loading order details...</span>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">❌</span>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Order not found</h3>
        <p className="text-muted-foreground mb-4">The order you&apos;re looking for doesn&apos;t exist</p>
        <Link to="/orders">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">← Back to Orders</Button>
        </Link>
      </div>
    )
  }

  const total = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <Link to="/orders" className="hover:text-foreground transition-colors">
              Orders
            </Link>
            <span>›</span>
            <span className="text-foreground">Order Details</span>
          </nav>
          <div className="flex items-center space-x-3">
            <h1 className="page-header gradient-text">Order #{order.id.slice(0, 8)}</h1>
            {isRefreshing && (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <p className="text-muted-foreground">Complete order information and item details</p>
        </div>
        <Link to="/orders">
          <Button variant="outline" className="border-border hover:bg-muted bg-transparent">
            ← Back to Orders
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {/* Order Summary */}
        <div className="gradient-card rounded-lg p-6">
          <h3 className="section-header">Order Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                <p className="text-base font-medium text-card-foreground">{order.customer?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base text-card-foreground">{order.customer?.email || "N/A"}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === "COMPLETED"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                <p className="text-base text-card-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="gradient-card rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="section-header mb-0">Order Items</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-left font-semibold">Product</TableHead>
                <TableHead className="text-center font-semibold">Quantity</TableHead>
                <TableHead className="text-right font-semibold">Unit Price</TableHead>
                <TableHead className="text-right font-semibold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, index) => (
                <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-card-foreground">Product ID: {item.productId}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{item.quantity}</TableCell>
                  <TableCell className="text-right text-muted-foreground">${Number(item.price).toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium text-card-foreground">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Order Total */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-xs text-muted-foreground">Including all items</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
