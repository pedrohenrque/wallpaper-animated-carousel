import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { View } from 'react-native'
import { Dashboard } from './src/Dashboard'

export default function WallpaperAnimatedCarousel() {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  )
}
