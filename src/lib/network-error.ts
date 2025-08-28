import { toast } from '@/hooks/use-toast';

export function showNetworkErrorToast(error: unknown, message = 'Please try again.') {
  console.error(error);
  toast({
    title: 'Network Error',
    description: message,
    variant: 'destructive',
  });
}

