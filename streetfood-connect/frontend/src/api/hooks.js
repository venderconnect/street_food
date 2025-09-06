import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';

// Products
export const useProducts = (opts) =>
  useQuery({
    queryKey: ['products', opts],
    queryFn: async () => (await api.get('/api/products', { params: opts })).data
  });

export const useProduct = (id) =>
  useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await api.get(`/api/products/${id}`)).data,
    enabled: !!id,
  });

// Orders
export const useMyOrders = () =>
  useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => (await api.get('/api/orders/mine')).data
  });

export const useCreateGroupOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/api/orders', body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-orders'] }),
  });
};

export const useJoinGroupOrder = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (quantity) => api.post(`/api/orders/${id}/join`, { quantity }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });
};

export const useUpdateQuantity = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (quantity) => api.patch(`/api/orders/${id}/quantity`, { quantity }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });
};

export const useCloseGroupOrder = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/api/orders/${id}/close`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });
};

// Reviews
export const useProductReviews = (productId) =>
  useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => (await api.get(`/api/products/${productId}`)).data, // backend can be extended to return reviews endpoint
    enabled: !!productId,
    select: (p) => p, // replace with real reviews once reviews list endpoint exists
  });

export const useCreateReview = (productId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rating, text }) =>
      api.post('/api/reviews', { productId, rating, text }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product', productId] });
      qc.invalidateQueries({ queryKey: ['reviews', productId] });
    },
  });
};

// Profiles
export const useSupplierProfile = (id) =>
  useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => (await api.get(`/api/profiles/supplier/${id}`)).data,
    enabled: !!id,
  });

export const useVendorProfile = (id) =>
  useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => (await api.get(`/api/profiles/vendor/${id}`)).data,
    enabled: !!id,
  });

// Dashboard
export const useDashboardRevenue = () =>
  useQuery({
    queryKey: ['dash-revenue'],
    queryFn: async () => (await api.get('/api/dashboard/revenue')).data
  });
