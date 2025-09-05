"use client"

import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { api } from "./lib/api"
import type { Customer, Product, Order } from "./lib/api"

function App() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const [customersData, productsData, ordersData] = await Promise.all([
        api.customers.list(),
        api.products.list(),
        api.orders.list()
      ])
      setCustomers(customersData)
      setProducts(productsData)
      setOrders(ordersData)
    } catch {
      // Silently handle error for stats display
    }
  }, [])

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
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="page-header gradient-text">Dashboard Overview</h1>
          {isRefreshing && (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        <p className="text-muted-foreground">Welcome to your QK order management system</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/customers"
          className="gradient-card gradient-card-hover rounded-lg p-6 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customers</p>
              <p className="text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                {customers.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Manage customer database</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <span className="text-primary text-lg">👥</span>
            </div>
          </div>
        </Link>

        <Link
          to="/products"
          className="gradient-card gradient-card-hover rounded-lg p-6 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Products</p>
              <p className="text-2xl font-bold text-card-foreground group-hover:text-secondary transition-colors">
                {products.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Manage product catalog</p>
            </div>
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
              <span className="text-secondary text-lg">📦</span>
            </div>
          </div>
        </Link>

        <Link
          to="/orders"
          className="gradient-card gradient-card-hover rounded-lg p-6 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Orders</p>
              <p className="text-2xl font-bold text-card-foreground group-hover:text-accent transition-colors">
                {orders.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Track order fulfillment</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <span className="text-accent text-lg">📋</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions Section */}
      <div className="gradient-card rounded-lg p-6">
          <h3 className="section-header">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/customers/new"
              className="flex items-center justify-between p-4 gradient-primary/10 border border-primary/20 rounded-lg hover:gradient-primary/20 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="text-primary text-sm">👤</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Add New Customer</p>
                  <p className="text-sm text-muted-foreground">Create customer profile</p>
                </div>
              </div>
              <span className="text-primary">→</span>
            </Link>

            <Link
              to="/products/new"
              className="flex items-center justify-between p-4 gradient-secondary/10 border border-secondary/20 rounded-lg hover:gradient-secondary/20 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <span className="text-secondary text-sm">📦</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Add New Product</p>
                  <p className="text-sm text-muted-foreground">Expand your catalog</p>
                </div>
              </div>
              <span className="text-secondary">→</span>
            </Link>

            <Link
              to="/orders/new"
              className="flex items-center justify-between p-4 gradient-accent/10 border border-accent/20 rounded-lg hover:gradient-accent/20 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <span className="text-accent text-sm">📋</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Create New Order</p>
                  <p className="text-sm text-muted-foreground">Process customer order</p>
                </div>
              </div>
              <span className="text-accent">→</span>
            </Link>
          </div>
        </div>
    </div>
  )
}

export default App
