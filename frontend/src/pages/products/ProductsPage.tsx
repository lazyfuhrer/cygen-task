"use client"

import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { api } from "../../lib/api"
import type { Product } from "../../lib/api"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { useToast } from "../../components/ui/Toast"
import { ConfirmationDialog } from "../../components/ui/confirmation-dialog"
import { getErrorMessage } from "../../lib/error-handler"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null
  })
  const [deleting, setDeleting] = useState(false)
  const { show } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.products.list()
      setProducts(data)
    } catch (e: unknown) {
      show({ type: "error", message: e instanceof Error ? e.message : 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }, [show])

  const handleDelete = async () => {
    if (!deleteDialog.product) return
    
    setDeleting(true)
    try {
      await api.products.delete(deleteDialog.product.id)
      show({ type: "success", message: "Product deleted successfully" })
      setDeleteDialog({ isOpen: false, product: null })
      load() // Refresh the list
    } catch (e: unknown) {
      const errorMessage = getErrorMessage(e, 'Failed to delete product')
      show({ type: "error", message: errorMessage })
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteDialog = (product: Product) => {
    setDeleteDialog({ isOpen: true, product })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, product: null })
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

  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + Number(product.price) * product.stock, 0)
  const lowStockProducts = products.filter((p) => p.stock < 10).length
  const outOfStockProducts = products.filter((p) => p.stock === 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="page-header gradient-text">Product Management</h1>
            {isRefreshing && (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <p className="text-muted-foreground">Manage your product catalog and inventory levels</p>
        </div>
        <Link to="/products/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">+ Add Product</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="gradient-card gradient-card-hover rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold text-card-foreground">{totalProducts}</p>
            </div>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary text-sm">📦</span>
            </div>
          </div>
        </div>
        <div className="gradient-card gradient-card-hover rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
              <p className="text-2xl font-bold text-card-foreground">${totalValue.toFixed(2)}</p>
            </div>
            <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
              <span className="text-secondary text-sm">💰</span>
            </div>
          </div>
        </div>
        <div className="gradient-card gradient-card-hover rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold text-card-foreground">{lowStockProducts}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm">⚠️</span>
            </div>
          </div>
        </div>
        <div className="gradient-card gradient-card-hover rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold text-card-foreground">{outOfStockProducts}</p>
            </div>
            <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm">❌</span>
            </div>
          </div>
        </div>
      </div>

      <div className="gradient-card rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="section-header mb-0">Product Catalog</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Loading products...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-4">Add your first product to start building your catalog</p>
            <Link to="/products/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Add First Product</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-left font-semibold">Product Name</TableHead>
                <TableHead className="text-right font-semibold">Price</TableHead>
                <TableHead className="text-center font-semibold">Stock</TableHead>
                <TableHead className="text-right font-semibold">Value</TableHead>
                <TableHead className="text-center font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const productValue = Number(p.price) * p.stock
                const stockStatus = p.stock === 0 ? "out" : p.stock < 10 ? "low" : "good"

                return (
                  <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-card-foreground">{p.name}</TableCell>
                    <TableCell className="text-right font-medium text-card-foreground">${Number(p.price).toFixed(2)}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{p.stock}</TableCell>
                    <TableCell className="text-right text-muted-foreground">${productValue.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          stockStatus === "out"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : stockStatus === "low"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : "bg-green-100 text-green-800 border border-green-200"
                        }`}
                      >
                        {stockStatus === "out" ? "Out of Stock" : stockStatus === "low" ? "Low Stock" : "In Stock"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/products/${p.id}`}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
                        >
                          Edit
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(p)}
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
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteDialog.product?.name}"? This action cannot be undone.`}
        isLoading={deleting}
      />
    </div>
  )
}
