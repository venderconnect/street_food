import { useQuery, useMutation, useQueryClient, useIsFetching } from '@tanstack/react-query';
import api from './client';
import { useErrorBoundary } from '../components/common/ErrorBoundary';

// Custom hook for global loading state
export const useGlobalLoading = () => useIsFetching() > 0;

// Products
export const useProducts = (opts = {}) => {
  const { showBoundary } = useErrorBoundary();
  
  return useQuery({
    queryKey: ['products', opts],
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/products', { params: opts });
        return data;
      } catch (error) {
        showBoundary(error);
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  });
};

export const useProduct = (id) => {
  const { showBoundary } = useErrorBoundary();
  
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        return data;
      } catch (error) {
        showBoundary(error);
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

// Orders
export const useMyOrders = () => {
  const { showBoundary } = useErrorBoundary();
  
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/orders/mine');
        return data;
      } catch (error) {
        showBoundary(error);
      }
    },
    staleTime: 1000 * 30, // Cache for 30 seconds
  });
};

export const useCreateGroupOrder = () => {
  const qc = useQueryClient();
  const { showBoundary } = useErrorBoundary();

  return useMutation({
    mutationFn: async (body) => {
      try {
        const { data } = await api.post('/api/orders', body);
        return data;
      } catch (error) {
        showBoundary(error);
      }
    },
    onMutate: async (newOrder) => {
      await qc.cancelQueries({ queryKey: ['my-orders'] });
      const previousOrders = qc.getQueryData(['my-orders']);
      
      qc.setQueryData(['my-orders'], (old) => ({
        ...old,
        orders: [{ ...newOrder, status: 'pending' }, ...(old?.orders || [])],
      }));

      return { previousOrders };
    },
    onError: (err, newOrder, context) => {
      qc.setQueryData(['my-orders'], context.previousOrders);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });
};

export const useJoinGroupOrder = (id) => {
  const qc = useQueryClient();
  const { showBoundary } = useErrorBoundary();

  return useMutation({
    mutationFn: async (quantity) => {
      try {
        const { data } = await api.post(`/api/orders/${id}/join`, { quantity });
        return data;
      } catch (error) {
        showBoundary(error);
      }
    },
    onMutate: async (quantity) => {
      await qc.cancelQueries({ queryKey: ['order', id] });
      const previousOrder = qc.getQueryData(['order', id]);

      qc.setQueryData(['order', id], (old) => ({
        ...old,
        participants: [...(old?.participants || []), { quantity }],
      }));

      return { previousOrder };
    },
    onError: (err, quantity, context) => {
      qc.setQueryData(['order', id], context.previousOrder);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });
};

export const useUpdateQuantity = (id) => {
  const qc = useQueryClient();
  const { showBoundary } = useErrorBoundary();

  return useMutation({
    mutationFn: async (quantity) => {
      try {
        const { data } = await api.patch(`/api/orders/${id}/quantity`, { quantity });
        return data;
      } catch (error) {
        showBoundary(error);
      }
    },
    onMutate: async (newQuantity) => {
      await qc.cancelQueries({ queryKey: ['order', id] });
      const previousOrder = qc.getQueryData(['order', id]);

      qc.setQueryData(['order', id], (old) => ({
        ...old,
        quantity: newQuantity,
      }));

      return { previousOrder };
    },
    onError: (err, newQuantity, context) => {
      qc.setQueryData(['order', id], context.previousOrder);
    },
    onSettled: () => {
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
export const useProductReviews = (productId) => {
  const { showBoundary } = useErrorBoundary();

  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/products/${productId}`);
        return data;
      } catch (error) {
        showBoundary(error);
      }
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
    select: (data) => data?.reviews || [], // Assuming reviews are nested in the response
  });
};

export const useCreateReview = (productId) => {
  const qc = useQueryClient();
  const { showBoundary } = useErrorBoundary();

  return useMutation({
    mutationFn: async ({ rating, text }) => {
      try {
        const { data } = await api.post('/api/reviews', { productId, rating, text });
        return data;
      } catch (error) {
        showBoundary(error);
      }
    },
    onMutate: async (newReview) => {
      await qc.cancelQueries({ queryKey: ['reviews', productId] });
      const previousReviews = qc.getQueryData(['reviews', productId]);

      qc.setQueryData(['reviews', productId], (old = []) => [
        { ...newReview, status: 'pending' },
        ...old,
      ]);

      return { previousReviews };
    },
    onError: (err, newReview, context) => {
      qc.setQueryData(['reviews', productId], context.previousReviews);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['product', productId] });
      qc.invalidateQueries({ queryKey: ['reviews', productId] });
    },
  });
};

// Profiles
export const useSupplierProfile = (id) => {
  const { showBoundary } = useErrorBoundary();

  return useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/profiles/supplier/${id}`);
        return data;
      } catch (error) {
        showBoundary(error);
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    retry: 2,
  });
};

export const useVendorProfile = (id) => {
  const { showBoundary } = useErrorBoundary();

  return useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/profiles/vendor/${id}`);
        return data;
      } catch (error) {
        showBoundary(error);
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
};

// Dashboard
export const useDashboardRevenue = () => {
  const { showBoundary } = useErrorBoundary();

  return useQuery({
    queryKey: ['dash-revenue'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/dashboard/revenue');
        return data;
      } catch (error) {
        showBoundary(error);
      }
    },
    staleTime: 1000 * 60, // Cache for 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};
