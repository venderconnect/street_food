import { useToast } from '../components/common/Toast';

export function useMutationWithToast(mutation, options = {}) {
  const toast = useToast();
  const {
    onSuccess: userOnSuccess,
    onError: userOnError,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred. Please try again.',
    ...mutationOptions
  } = options;

  return mutation({
    ...mutationOptions,
    onSuccess: (...args) => {
      toast(successMessage);
      userOnSuccess?.(...args);
    },
    onError: (error, ...args) => {
      toast(error?.response?.data?.message || errorMessage, 'error');
      userOnError?.(error, ...args);
    },
  });
}

export function withErrorBoundary(queryFn) {
  return async (...args) => {
    try {
      return await queryFn(...args);
    } catch (error) {
      if (error?.response?.status === 401) {
        // Handle unauthorized error (e.g., redirect to login)
        window.location.href = '/login';
      }
      throw error;
    }
  };
}
