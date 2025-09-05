"use client"

import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { api } from "../../lib/api"
import type { Order } from "../../lib/api"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import Select from "../../components/ui/Select"
import { useToast } from "../../components/ui/Toast"
import { ConfirmationDialog } from "../../components/ui/confirmation-dialog"
import { getErrorMessage } from "../../lib/error-handler"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; order: Order | null }>({
    isOpen: false,
    order: null
  })
  const [deleting, setDeleting] = useState(false)
  const { show } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.orders.list()
      setOrders(data)
    } catch (e: unknown) {
      show({ type: "error", message: e instanceof Error ? e.message : 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }, [show])

  async function updateOrderStatus(orderId: string, newStatus: "PENDING" | "COMPLETED" | "CANCELLED") {
    try {
      await api.orders.update(orderId, { status: newStatus })
      show({ type: "success", message: `Order status updated to ${newStatus}` })
      load() // Refresh the orders list
    } catch (e: unknown) {
      show({ type: "error", message: e instanceof Error ? e.message : 'An error occurred' })
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.order) return
    
    setDeleting(true)
    try {
      await api.orders.delete(deleteDialog.order.id)
      show({ type: "success", message: "Order deleted successfully" })
      setDeleteDialog({ isOpen: false, order: null })
      load() // Refresh the list
    } catch (e: unknown) {
      const errorMessage = getErrorMessage(e, 'Failed to delete order')
      show({ type: "error", message: errorMessage })
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteDialog = (order: Order) => {
    setDeleteDialog({ isOpen: true, order })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, order: null })
  }

  useEffect(() => {
    load()
  }, [load])

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

  const pendingOrders = orders.filter((o) => o.status === "PENDING").length
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length
  const totalRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + Number(item.price) * item.quantity, 0),
      0,
    )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="page-header gradient-text">Order Management</h1>
            {isRefreshing && (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <p className="text-muted-foreground">Track and manage customer orders and fulfillment</p>
        </div>
        <Link to="/orders/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">+ Create Order</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="gradient-card gradient-card-hover rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-card-foreground">{orders.length}</p>
            </div>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary text-sm">📋</span>
            </div>
          </div>
        </div>
        <div className="gradient-card gradient-card-hover rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-card-foreground">{pendingOrders}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm">⏳</span>
            </div>
          </div>
        </div>
        <div className="gradient-card gradient-card-hover rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-card-foreground">{completedOrders}</p>
            </div>
            <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✅</span>
            </div>
          </div>
        </div>
        <div className="gradient-card gradient-card-hover rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold text-card-foreground">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
              <span className="text-secondary text-sm">💰</span>
            </div>
          </div>
        </div>
      </div>

      <div className="gradient-card rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="section-header mb-0">Order History</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Loading orders...</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">Create your first order to get started</p>
            <Link to="/orders/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Create First Order</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-left font-semibold">Order ID</TableHead>
                <TableHead className="text-left font-semibold">Customer</TableHead>
                <TableHead className="text-left font-semibold">Status</TableHead>
                <TableHead className="text-left font-semibold">Items</TableHead>
                <TableHead className="text-left font-semibold">Total</TableHead>
                <TableHead className="text-left font-semibold">Date</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => {
                const total = o.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
                const customerName = o.customer?.name || "Unknown Customer"
                return (
                  <TableRow key={o.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground">{o.id.slice(0, 8)}...</TableCell>
                    <TableCell className="font-medium text-card-foreground">{customerName}</TableCell>
                    <TableCell>
                      <Select
                        value={o.status}
                        onChange={(e) =>
                          updateOrderStatus(o.id, e.target.value as "PENDING" | "COMPLETED" | "CANCELLED")
                        }
                        className="text-xs min-w-28 border-border"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{o.items.length} item(s)</TableCell>
                    <TableCell className="font-medium text-card-foreground">${total.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/orders/${o.id}`}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
                        >
                          View Details
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(o)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Order"
        message={`Are you sure you want to delete order ${deleteDialog.order?.id.slice(0, 8)}...? This action cannot be undone.`}
        isLoading={deleting}
      />
    </div>
  )
}
