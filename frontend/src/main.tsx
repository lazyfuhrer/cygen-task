import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider, Link, Outlet, useLocation } from "react-router-dom"
import App from "./App"
import "./index.css"
import CustomersPage from "./pages/customers/CustomersPage"
import CustomerFormPage from "./pages/customers/CustomerFormPage"
import ProductsPage from "./pages/products/ProductsPage"
import ProductFormPage from "./pages/products/ProductFormPage"
import OrdersPage from "./pages/orders/OrdersPage"
import OrderFormPage from "./pages/orders/OrderFormPage"
import OrderDetailPage from "./pages/orders/OrderDetailPage"
import { ToastProvider } from "./components/ui/Toast"
import { SidebarDataManagement } from "./components/SidebarDataManagement"

function Layout() {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true
    if (path !== "/" && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Enhanced Sidebar Navigation */}
        <nav className="w-64 sidebar-gradient border-r border-sidebar-border min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">QK</span>
              </div>
              <h1 className="text-xl font-bold text-sidebar-foreground">Quick Kart</h1>
            </div>

            <div className="space-y-1">
              <Link
                to="/"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive("/")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <span className="mr-3 text-base">📊</span>
                Dashboard
              </Link>

              <Link
                to="/customers"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive("/customers")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <span className="mr-3 text-base">👥</span>
                Customers
              </Link>

              <Link
                to="/products"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive("/products")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <span className="mr-3 text-base">📦</span>
                Products
              </Link>

              <Link
                to="/orders"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive("/orders")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <span className="mr-3 text-base">📋</span>
                Orders
              </Link>
            </div>

            {/* Data Management Buttons */}
            <div className="mt-8 pt-6 border-t border-sidebar-border">
              <SidebarDataManagement />
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@qk.com</p>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-8 pb-16">
          <div className="max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "customers/new", element: <CustomerFormPage /> },
      { path: "customers/:id", element: <CustomerFormPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/new", element: <ProductFormPage /> },
      { path: "products/:id", element: <ProductFormPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "orders/new", element: <OrderFormPage /> },
      { path: "orders/:id", element: <OrderDetailPage /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </React.StrictMode>,
)
