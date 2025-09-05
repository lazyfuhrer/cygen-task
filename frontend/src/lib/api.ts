import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export const http = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

export type Customer = { id: string; name: string; email: string; phone?: string | null; createdAt: string };
export type Product = { id: string; name: string; price: string; stock: number; createdAt: string };
export type CreateProductData = { name: string; price: number; stock: number };
export type UpdateProductData = Partial<CreateProductData>;
export type OrderItem = { id: string; orderId: string; productId: string; quantity: number; price: string };
export type Order = { id: string; customerId: string; status: 'PENDING' | 'COMPLETED' | 'CANCELLED'; date: string; items: OrderItem[]; createdAt: string; customer?: { id: string; name: string; email: string } };
export type AdminStats = { customers: number; products: number; orders: number; orderItems: number };
export type SeedResponse = { message: string; data: { customers: number; products: number; orders: number } };

// Generic API function for direct HTTP calls
export const apiCall = async <T = unknown>(url: string, options?: { method?: string; body?: string; headers?: Record<string, string> }): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: options?.body,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const api = {
  customers: {
    list: () => http.get<Customer[]>('/customers').then((r) => r.data),
    get: (id: string) => http.get<Customer>(`/customers/${id}`).then((r) => r.data),
    create: (data: Partial<Customer>) => http.post<Customer>('/customers', data).then((r) => r.data),
    update: (id: string, data: Partial<Customer>) => http.put<Customer>(`/customers/${id}`, data).then((r) => r.data),
    delete: (id: string) => http.delete(`/customers/${id}`).then(() => undefined),
  },
  products: {
    list: () => http.get<Product[]>('/products').then((r) => r.data),
    get: (id: string) => http.get<Product>(`/products/${id}`).then((r) => r.data),
    create: (data: CreateProductData) => http.post<Product>('/products', data).then((r) => r.data),
    update: (id: string, data: UpdateProductData) => http.put<Product>(`/products/${id}`, data).then((r) => r.data),
    delete: (id: string) => http.delete(`/products/${id}`).then(() => undefined),
  },
  orders: {
    list: () => http.get<Order[]>('/orders').then((r) => r.data),
    get: (id: string) => http.get<Order>(`/orders/${id}`).then((r) => r.data),
    create: (data: { customerId: string; status?: Order['status']; items: Array<{ productId: string; quantity: number; price: number }> }) =>
      http.post<Order>('/orders', data).then((r) => r.data),
    update: (id: string, data: Partial<{ customerId: string; status: Order['status'] }>) => http.put<Order>(`/orders/${id}`, data).then((r) => r.data),
    delete: (id: string) => http.delete(`/orders/${id}`).then(() => undefined),
  },
  admin: {
    seed: () => http.post<SeedResponse>('/admin/seed').then((r) => r.data),
    clear: () => http.delete<{ message: string }>('/admin/clear').then((r) => r.data),
    stats: () => http.get<AdminStats>('/admin/stats').then((r) => r.data),
  },
};
