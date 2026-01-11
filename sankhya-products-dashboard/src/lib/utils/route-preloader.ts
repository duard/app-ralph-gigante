/**
 * Route preloading utilities for better performance
 * 
 * These utilities help preload route chunks based on user behavior
 * to improve perceived performance and reduce loading times.
 */

type ChunkName = 
  | 'dashboard'
  | 'produtos' 
  | 'auth'
  | 'settings'
  | 'errors'
  | 'communication'
  | 'tasks'
  | 'content'
  | 'routes'

/**
 * Preload a specific route chunk
 */
export function preloadRouteChunk(chunkName: ChunkName): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = `/assets/routes/${chunkName}-[hash].js`
    link.as = 'script'
    
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to preload chunk: ${chunkName}`))
    
    document.head.appendChild(link)
  })
}

/**
 * Intelligent preloading based on user interaction patterns
 */
export class RoutePreloader {
  private static instance: RoutePreloader
  private preloadedChunks = new Set<ChunkName>()
  private observer: IntersectionObserver | null = null

  private constructor() {
    this.setupIntersectionObserver()
    this.setupEventListeners()
  }

  static getInstance(): RoutePreloader {
    if (!RoutePreloader.instance) {
      RoutePreloader.instance = new RoutePreloader()
    }
    return RoutePreloader.instance
  }

  /**
   * Preload chunks when links enter viewport
   */
  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) return

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLElement
            const chunkName = this.getChunkNameFromLink(link)
            
            if (chunkName && !this.preloadedChunks.has(chunkName)) {
              this.preloadChunk(chunkName)
            }
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )
  }

  /**
   * Setup event listeners for hover and focus
   */
  private setupEventListeners(): void {
    // Preload on hover with debounce
    let hoverTimeout: NodeJS.Timeout
    
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLElement | null
      
      if (link) {
        clearTimeout(hoverTimeout)
        hoverTimeout = setTimeout(() => {
          const chunkName = this.getChunkNameFromLink(link)
          if (chunkName && !this.preloadedChunks.has(chunkName)) {
            this.preloadChunk(chunkName)
          }
        }, 100) // Small delay to avoid unnecessary preloads
      }
    })

    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimeout)
    })

    // Preload on focus for keyboard navigation
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLElement | null
      
      if (link) {
        const chunkName = this.getChunkNameFromLink(link)
        if (chunkName && !this.preloadedChunks.has(chunkName)) {
          this.preloadChunk(chunkName)
        }
      }
    })
  }

  /**
   * Extract chunk name from link href
   */
  private getChunkNameFromLink(link: HTMLElement): ChunkName | null {
    const href = link.getAttribute('href') || ''
    
    // Map routes to chunk names
    const routeToChunk: Record<string, ChunkName> = {
      '/dashboard': 'dashboard',
      '/dashboard-2': 'dashboard', 
      '/bem-vindo': 'dashboard',
      '/landing': 'dashboard',
      '/produtos': 'produtos',
      '/auth': 'auth',
      '/settings': 'settings',
      '/mail': 'communication',
      '/chat': 'communication',
      '/calendar': 'communication',
      '/tasks': 'tasks',
      '/users': 'content',
      '/faqs': 'content',
      '/pricing': 'content',
      '/errors': 'errors'
    }

    // Find matching chunk by checking if href starts with any route prefix
    for (const [route, chunk] of Object.entries(routeToChunk)) {
      if (href.startsWith(route)) {
        return chunk
      }
    }

    return null
  }

  /**
   * Preload a single chunk
   */
  private async preloadChunk(chunkName: ChunkName): Promise<void> {
    try {
      await preloadRouteChunk(chunkName)
      this.preloadedChunks.add(chunkName)
      console.log(`✅ Preloaded route chunk: ${chunkName}`)
    } catch (error) {
      console.warn(`❌ Failed to preload route chunk: ${chunkName}`, error)
    }
  }

  /**
   * Preload multiple route chunks
   */
  public async preloadChunks(chunkNames: ChunkName[]): Promise<void> {
    const promises = chunkNames.map(chunkName => this.preloadChunk(chunkName))
    try {
      await Promise.all(promises)
    } catch (error) {
      console.warn('Some route chunks failed to preload:', error)
    }
  }

  /**
   * Observe links for preloading
   */
  public observeLinks(): void {
    if (!this.observer) return

    const links = document.querySelectorAll('a[href]') as NodeListOf<HTMLElement>
    links.forEach(link => {
      this.observer!.observe(link)
    })
  }

  /**
   * Preload chunks likely to be needed next
   */
  public preloadLikelyRoutes(currentPath: string): void {
    const likelyRoutes: Record<string, ChunkName[]> = {
      '/dashboard': ['produtos', 'settings'],
      '/produtos': ['dashboard', 'settings'],
      '/auth': ['dashboard'],
      '/settings': ['dashboard', 'produtos'],
      '/': ['dashboard', 'auth']
    }

    const chunksToPreload = likelyRoutes[currentPath] || likelyRoutes['/']
    this.preloadChunks(chunksToPreload)
  }

  /**
   * Preload all chunks (for development or aggressive preloading)
   */
  public preloadAllChunks(): void {
    const allChunks: ChunkName[] = [
      'dashboard', 'produtos', 'auth', 'settings', 
      'errors', 'communication', 'tasks', 'content', 'routes'
    ]
    this.preloadChunks(allChunks)
  }
}

/**
 * Hook for React components to use route preloading
 */
export function useRoutePreloader(): RoutePreloader {
  return RoutePreloader.getInstance()
}

/**
 * Initialize route preloader in the application
 */
export function initializeRoutePreloader(): void {
  const preloader = RoutePreloader.getInstance()
  
  // Start observing links after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      preloader.observeLinks()
    })
  } else {
    preloader.observeLinks()
  }

  // Preload likely routes based on current path
  const currentPath = window.location.pathname
  preloader.preloadLikelyRoutes(currentPath)
}