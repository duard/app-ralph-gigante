/**
 * Code Splitting Debug Component
 * 
 * This component helps developers understand and visualize code splitting behavior.
 * Only available in development mode.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Package, CheckCircle, XCircle } from 'lucide-react'
import { useRoutePreloader } from '@/lib/utils/route-preloader'

type ChunkStatus = 'idle' | 'loading' | 'loaded' | 'error'

interface ChunkInfo {
  name: string
  status: ChunkStatus
  size?: number
  url?: string
  loadTime?: number
}

export function CodeSplittingDebug() {
  const [chunks, setChunks] = useState<Record<string, ChunkInfo>>({})
  const [isVisible, setIsVisible] = useState(false)
  const preloader = useRoutePreloader()

  // Track chunks that are currently loaded
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    // Monitor script tags to track loaded chunks
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            if (element.tagName === 'SCRIPT' && element.getAttribute('src')) {
              const src = element.getAttribute('src')!
              
              // Extract chunk name from script URL
              if (src.includes('/assets/routes/')) {
                const chunkMatch = src.match(/\/([^\/-]+)-[a-f0-9]+\.js$/)
                if (chunkMatch) {
                  const chunkName = chunkMatch[1]
                  
                  setChunks(prev => ({
                    ...prev,
                    [chunkName]: {
                      ...prev[chunkName],
                      name: chunkName,
                      status: 'loaded',
                      url: src,
                      loadTime: Date.now()
                    }
                  }))
                }
              }
            }
          }
        })
      })
    })

    observer.observe(document.head, { childList: true })

    return () => observer.disconnect()
  }, [])

  const preloadChunk = async (chunkName: string) => {
    setChunks(prev => ({
      ...prev,
      [chunkName]: {
        ...prev[chunkName],
        status: 'loading'
      }
    }))

    try {
      // In a real implementation, you would actually preload the chunk
      // For now, we'll simulate the loading
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
      
      setChunks(prev => ({
        ...prev,
        [chunkName]: {
          ...prev[chunkName],
          status: 'loaded',
          loadTime: Date.now()
        }
      }))
    } catch (error) {
      setChunks(prev => ({
        ...prev,
        [chunkName]: {
          ...prev[chunkName],
          status: 'error'
        }
      }))
    }
  }

  const getChunkIcon = (status: ChunkStatus) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'loaded':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Package className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: ChunkStatus) => {
    switch (status) {
      case 'loading':
        return 'bg-yellow-100 text-yellow-800'
      case 'loaded':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const allChunks = [
    'dashboard', 'produtos', 'auth', 'settings', 
    'errors', 'communication', 'tasks', 'content', 'routes',
    'react-vendor', 'ui-vendor', 'charts-vendor', 'forms-vendor', 'utils-vendor'
  ]

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsVisible(!isVisible)}
        size="sm"
        variant="outline"
        className="bg-white/90 backdrop-blur-sm"
      >
        <Package className="h-4 w-4 mr-2" />
        Code Splitting Debug
      </Button>

      {isVisible && (
        <Card className="w-96 mt-2 max-h-96 overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Code Splitting Monitor
            </CardTitle>
            <CardDescription>
              Monitor and test route-based code splitting performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                onClick={() => preloader.preloadAllChunks()}
                className="w-full"
              >
                Preload All Chunks
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setChunks({})}
                className="w-full"
              >
                Reset
              </Button>
            </div>

            <div className="space-y-2">
              {allChunks.map(chunkName => {
                const chunk = chunks[chunkName] || { name: chunkName, status: 'idle' as ChunkStatus }
                
                return (
                  <div
                    key={chunkName}
                    className="flex items-center justify-between p-2 rounded-lg border bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {getChunkIcon(chunk.status)}
                      <span className="text-sm font-medium">{chunk.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getStatusColor(chunk.status)}>
                        {chunk.status}
                      </Badge>
                      
                      {chunk.status !== 'loaded' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => preloadChunk(chunkName)}
                          disabled={chunk.status === 'loading'}
                        >
                          {chunk.status === 'loading' ? 'Loading...' : 'Load'}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <div>• Route chunks are loaded on-demand for better performance</div>
              <div>• Chunks are preloaded when links are hovered or focused</div>
              <div>• Vendor libraries are split into logical groups</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}