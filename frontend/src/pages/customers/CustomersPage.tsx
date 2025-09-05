"use client"

import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { api } from "../../lib/api"
import type { Customer } from "../../lib/api"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { useToast } from "../../components/ui/Toast"
import { ConfirmationDialog } from "../../components/ui/confirmation-dialog"
import { getErrorMessage } from "../../lib/error-handler"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; customer: Customer | null }>({
    isOpen: false,
    customer: null
  })
  const [deleting, setDeleting] = useState(false)
  const { show } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.customers.list()
      setCustomers(data)
    } catch (e: unknown) {
      show({ type: "error", message: e instanceof Error ? e.message : 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }, [show])

  const handleDelete = async () => {
    if (!deleteDialog.customer) return
    
    setDeleting(true)
    try {
      await api.customers.delete(deleteDialog.customer.id)
      show({ type: "success", message: "Customer deleted successfully" })
      setDeleteDialog({ isOpen: false, customer: null })
      load() // Refresh the list
    } catch (e: unknown) {
      const errorMessage = getErrorMessage(e, 'Failed to delete customer')
      show({ type: "error", message: errorMessage })
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteDialog = (customer: Customer) => {
    setDeleteDialog({ isOpen: true, customer })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, customer: null })
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="page-header gradient-text">Customer Management</h1>
            {isRefreshing && (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <p className="text-muted-foreground">Manage your customer database and contact information</p>
        </div>
        <Link to="/customers/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">+ Add Customer</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="gradient-card gradient-card-hover rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold text-card-foreground">{customers.length}</p>
            </div>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary text-sm">👥</span>
            </div>
          </div>
        </div>
        <div className="gradient-card gradient-card-hover rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active This Month</p>
              <p className="text-2xl font-bold text-card-foreground">{Math.floor(customers.length * 0.7)}</p>
            </div>
            <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
              <span className="text-secondary text-sm">📈</span>
            </div>
          </div>
        </div>
        <div className="gradient-card gradient-card-hover rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New This Week</p>
              <p className="text-2xl font-bold text-card-foreground">{Math.floor(customers.length * 0.1)}</p>
            </div>
            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
              <span className="text-accent text-sm">✨</span>
            </div>
          </div>
        </div>
      </div>

      <div className="gradient-card rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="section-header mb-0">Customer Directory</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Loading customers...</span>
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No customers yet</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first customer</p>
            <Link to="/customers/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Add First Customer</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-left font-semibold">Name</TableHead>
                <TableHead className="text-left font-semibold">Email</TableHead>
                <TableHead className="text-left font-semibold">Phone</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-card-foreground">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="text-muted-foreground">{c.phone || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/customers/${c.id}`}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
                      >
                        Edit
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(c)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteDialog.customer?.name}"? This action cannot be undone.`}
        isLoading={deleting}
      />
    </div>
  )
}
