// Estado global da aplicação
let currentPage = 1
let totalPages = 1
let currentQuery = ''
let authToken = localStorage.getItem('sankhyaToken') || ''
let searchTimeout
let allResults = []

// Elementos do DOM
const elements = {
  searchInput: document.getElementById('searchInput'),
  tokenInput: document.getElementById('tokenInput'),
  authStatus: document.getElementById('authStatus'),
  searchSuggestions: document.getElementById('searchSuggestions'),
  searchInfo: document.getElementById('searchInfo'),
  searchResults: document.getElementById('searchResults'),
  resultsGrid: document.getElementById('resultsGrid'),
  loadingState: document.getElementById('loadingState'),
  pagination: document.getElementById('pagination'),
  emptyState: document.getElementById('emptyState'),
  errorState: document.getElementById('errorState'),
  errorMessage: document.getElementById('errorMessage'),
  resultCount: document.getElementById('resultCount'),
  searchTime: document.getElementById('searchTime'),
  currentPageEl: document.getElementById('currentPage'),
  totalPagesEl: document.getElementById('totalPages'),
  pageNumbers: document.getElementById('pageNumbers'),
  productModal: document.getElementById('productModal'),
  modalContent: document.getElementById('modalContent'),
  estoqueMin: document.getElementById('estoqueMin'),
  estoqueMax: document.getElementById('estoqueMax'),
  statusFilter: document.getElementById('statusFilter'),
  perPage: document.getElementById('perPage'),
  clearSearchBtn: document.getElementById('clearSearch'),
  firstPage: document.getElementById('firstPage'),
  prevPage: document.getElementById('prevPage'),
  nextPage: document.getElementById('nextPage'),
  lastPage: document.getElementById('lastPage'),
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initializeApp()
})

function initializeApp() {
  setupEventListeners()
  updateAuthStatus()

  // Configurar token se já existir
  if (authToken) {
    elements.tokenInput.value = authToken
    updateAuthStatus(true)
  }

  // Focar no campo de busca
  elements.searchInput.focus()
}

function setupEventListeners() {
  // Busca com debounce
  elements.searchInput.addEventListener('input', (e) => {
    const value = e.target.value.trim()
    toggleClearButton(value)

    if (value.length >= 2) {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        performSearch()
      }, 300)
    }
  })

  // Busca ao pressionar Enter
  elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch()
    }
  })

  // Filtros
  ;['estoqueMin', 'estoqueMax', 'statusFilter'].forEach((id) => {
    elements[id].addEventListener('change', () => {
      if (currentQuery) performSearch()
    })
  })

  // Fechar sugestões ao clicar fora
  document.addEventListener('click', (e) => {
    if (
      !elements.searchSuggestions.contains(e.target) &&
      e.target !== elements.searchInput
    ) {
      elements.searchSuggestions.classList.add('hidden')
    }
  })
}

function updateAuthStatus(authenticated = false) {
  const statusIcon = authenticated
    ? 'fa-check-circle text-green-500'
    : 'fa-circle text-red-500'
  const statusText = authenticated ? 'Autenticado' : 'Não autenticado'

  elements.authStatus.innerHTML = `
        <i class="fas ${statusIcon}"></i> ${statusText}
    `
}

function saveToken() {
  const token = elements.tokenInput.value.trim()
  if (token) {
    authToken = token
    localStorage.setItem('sankhyaToken', token)
    updateAuthStatus(true)
    showNotification('Token salvo com sucesso!', 'success')
  } else {
    showNotification('Por favor, insira um token válido', 'error')
  }
}

function toggleClearButton(value) {
  if (value) {
    elements.clearSearchBtn.classList.remove('hidden')
  } else {
    elements.clearSearchBtn.classList.add('hidden')
  }
}

function clearSearch() {
  elements.searchInput.value = ''
  toggleClearButton(false)
  elements.searchSuggestions.classList.add('hidden')
  clearResults()
}

function clearFilters() {
  elements.estoqueMin.value = ''
  elements.estoqueMax.value = ''
  elements.statusFilter.value = 'S'
  elements.perPage.value = '50'
  currentPage = 1

  if (currentQuery) {
    performSearch()
  }
}

function clearResults() {
  hideAllStates()
  allResults = []
}

async function performSearch() {
  const query = elements.searchInput.value.trim()

  if (query.length < 2) {
    showNotification('Digite pelo menos 2 caracteres para buscar', 'warning')
    return
  }

  if (!authToken) {
    showNotification('Por favor, autentique-se com um token JWT', 'error')
    elements.tokenInput.focus()
    return
  }

  currentQuery = query
  currentPage = 1

  showLoading()
  hideAllStates()

  try {
    const startTime = Date.now()
    const results = await searchProducts(query, currentPage)
    const endTime = Date.now()

    if (results.error) {
      throw new Error(results.error)
    }

    allResults = results.data || []
    totalPages = results.lastPage || 1

    displayResults(results)
    updateSearchInfo(results, endTime - startTime)
    updatePagination()

    // Mostrar resultado apropriado
    if (allResults.length === 0) {
      showEmptyState()
    } else {
      showResults()
    }
  } catch (error) {
    console.error('Erro na busca:', error)
    showError(error.message)
  }
}

async function searchProducts(query, page = 1) {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    perPage: elements.perPage.value,
    ...(elements.estoqueMin.value && { estoqueMin: elements.estoqueMin.value }),
    ...(elements.estoqueMax.value && { estoqueMax: elements.estoqueMax.value }),
    ...(elements.statusFilter.value && { ativo: elements.statusFilter.value }),
  })

  const url = `http://localhost:3000/sankhya/tgfest/search-avancado?${params}`
  console.log(`[API Request] GET ${url}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  })

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  })

  console.log(
    `[API Response] ${response.status} ${response.statusText} GET ${url}`,
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error(
      `[API Response Error] ${response.status} GET ${url}`,
      errorData,
    )
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    )
  }

  const data = await response.json()
  console.log(`[API Response Data] GET ${url}`, data)
  return data
}

function displayResults(results) {
  elements.resultsGrid.innerHTML = ''

  results.data.forEach((product) => {
    const card = createProductCard(product)
    elements.resultsGrid.appendChild(card)
  })
}

function createProductCard(product) {
  const relevancyColor =
    {
      Alta: 'bg-green-100 text-green-800',
      Média: 'bg-yellow-100 text-yellow-800',
      Baixa: 'bg-gray-100 text-gray-800',
    }[product.relevancia] || 'bg-gray-100 text-gray-800'

  const card = document.createElement('div')
  card.className =
    'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer fade-in'
  card.onclick = () => showProductDetails(product)

  card.innerHTML = `
        <div class="p-6 h-full flex flex-col">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        ${highlightSearchTerm(product.descrprod)}
                    </h3>
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-layer-group mr-1"></i>
                        ${product.descrgrupoprod || 'Sem grupo'}
                    </p>
                </div>
                <span class="px-2 py-1 text-xs font-medium rounded-full ${relevancyColor}">
                    ${product.relevancia}
                </span>
            </div>
            
            <div class="flex-1 space-y-2">
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">
                        <i class="fas fa-cube mr-1"></i>
                        ${product.codprod}
                    </span>
                    <span class="text-sm font-medium ${product.estoque > 0 ? 'text-green-600' : 'text-red-600'}">
                        ${product.estoque} unid.
                    </span>
                </div>
                
                <div class="text-sm text-gray-600">
                    <i class="fas fa-map-marker-alt mr-1"></i>
                    ${product.nome_local || 'Sem local'}
                </div>
                
                <div class="text-sm text-gray-600">
                    <i class="fas fa-building mr-1"></i>
                    ${product.nome_parceiro || 'Sem parceiro'}
                </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-200">
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500">
                        ${
                          product.ativo === 'S'
                            ? '<i class="fas fa-check-circle text-green-500 mr-1"></i>Ativo'
                            : '<i class="fas fa-times-circle text-red-500 mr-1"></i>Inativo'
                        }
                    </span>
                    <button onclick="event.stopPropagation(); showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <i class="fas fa-info-circle mr-1"></i>Detalhes
                    </button>
                </div>
            </div>
        </div>
    `

  return card
}

function highlightSearchTerm(text) {
  if (!currentQuery) return text

  const regex = new RegExp(`(${currentQuery.split(' ').join('|')})`, 'gi')
  return text.replace(regex, '<span class="search-highlight">$1</span>')
}

function showProductDetails(product) {
  const modal = elements.productModal
  const content = elements.modalContent

  content.innerHTML = `
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Informações Básicas -->
                <div class="space-y-4">
                    <h4 class="text-lg font-semibold text-gray-900">
                        <i class="fas fa-box mr-2"></i>Informações Básicas
                    </h4>
                    
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-sm font-medium text-gray-700">Código:</span>
                            <span class="text-sm text-gray-900">${product.codprod}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm font-medium text-gray-700">Descrição:</span>
                            <span class="text-sm text-gray-900">${product.descrprod}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm font-medium text-gray-700">Grupo:</span>
                            <span class="text-sm text-gray-900">${product.descrgrupoprod || 'N/A'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm font-medium text-gray-700">Status:</span>
                            <span class="text-sm ${product.ativo === 'S' ? 'text-green-600' : 'text-red-600'}">
                                ${product.ativo === 'S' ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Informações de Estoque -->
                <div class="space-y-4">
                    <h4 class="text-lg font-semibold text-gray-900">
                        <i class="fas fa-warehouse mr-2"></i>Estoque
                    </h4>
                    
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-sm font-medium text-gray-700">Estoque Atual:</span>
                            <span class="text-sm font-medium ${product.estoque > 0 ? 'text-green-600' : 'text-red-600'}">
                                ${product.estoque}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm font-medium text-gray-700">Estoque Mínimo:</span>
                            <span class="text-sm text-gray-900">${product.estmin || 'N/A'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm font-medium text-gray-700">Estoque Máximo:</span>
                            <span class="text-sm text-gray-900">${product.estmax || 'N/A'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm font-medium text-gray-700">Local:</span>
                            <span class="text-sm text-gray-900">${product.nome_local || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Informações Adicionais -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <h4 class="text-lg font-semibold text-gray-900">
                        <i class="fas fa-truck mr-2"></i>Parceiro
                    </h4>
                    
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-sm font-medium text-gray-700">Nome:</span>
                            <span class="text-sm text-gray-900">${product.nome_parceiro || 'N/A'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm font-medium text-gray-700">Código:</span>
                            <span class="text-sm text-gray-900">${product.codparc || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <h4 class="text-lg font-semibold text-gray-900">
                        <i class="fas fa-star mr-2"></i>Relevância
                    </h4>
                    
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-sm font-medium text-gray-700">Score:</span>
                            <span class="text-sm text-gray-900">${product.search_score || 'N/A'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm font-medium text-gray-700">Classificação:</span>
                            <span class="text-sm font-medium ${getRelevancyColor(product.relevancia)}">
                                ${product.relevancia || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `

  modal.classList.remove('hidden')
}

function getRelevancyColor(relevancia) {
  const colors = {
    Alta: 'text-green-600',
    Média: 'text-yellow-600',
    Baixa: 'text-gray-600',
  }
  return colors[relevancia] || 'text-gray-600'
}

function closeModal() {
  elements.productModal.classList.add('hidden')
}

function updateSearchInfo(results, searchTimeMs) {
  elements.resultCount.textContent = results.total || 0
  elements.searchTime.textContent = `${searchTimeMs}ms`
  elements.currentPageEl.textContent = currentPage
  elements.totalPagesEl.textContent = totalPages

  elements.searchInfo.classList.remove('hidden')
}

function updatePagination() {
  if (totalPages <= 1) {
    elements.pagination.classList.add('hidden')
    return
  }

  elements.pagination.classList.remove('hidden')

  // Atualizar botões de navegação
  elements.firstPage.disabled = currentPage === 1
  elements.prevPage.disabled = currentPage === 1
  elements.nextPage.disabled = currentPage === totalPages
  elements.lastPage.disabled = currentPage === totalPages

  // Gerar números de página
  const pageNumbers = generatePageNumbers(currentPage, totalPages)
  elements.pageNumbers.innerHTML = pageNumbers
    .map((pageNum) => {
      const isActive = pageNum === currentPage
      const buttonClass = isActive
        ? 'bg-blue-600 text-white'
        : 'bg-white text-gray-700 hover:bg-gray-50'

      return `
            <button onclick="goToPage(${pageNum})" 
                    class="px-3 py-2 border border-gray-300 rounded-md transition ${buttonClass}">
                ${pageNum}
            </button>
        `
    })
    .join('')
}

function generatePageNumbers(current, total, maxVisible = 5) {
  const pages = []
  const half = Math.floor(maxVisible / 2)

  let start = Math.max(1, current - half)
  let end = Math.min(total, current + half)

  if (end - start < maxVisible - 1) {
    if (start === 1) {
      end = Math.min(total, start + maxVisible - 1)
    } else {
      start = Math.max(1, end - maxVisible + 1)
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
}

function goToPage(page) {
  if (page < 1 || page > totalPages || page === currentPage) return

  currentPage = page
  performSearch()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function showLoading() {
  elements.loadingState.classList.remove('hidden')
  elements.searchResults.classList.add('hidden')
  elements.emptyState.classList.add('hidden')
  elements.errorState.classList.add('hidden')
  elements.pagination.classList.add('hidden')
}

function showResults() {
  elements.loadingState.classList.add('hidden')
  elements.searchResults.classList.remove('hidden')
  elements.emptyState.classList.add('hidden')
  elements.errorState.classList.add('hidden')
}

function showEmptyState() {
  elements.loadingState.classList.add('hidden')
  elements.searchResults.classList.add('hidden')
  elements.emptyState.classList.remove('hidden')
  elements.errorState.classList.add('hidden')
  elements.pagination.classList.add('hidden')
}

function showError(message) {
  elements.errorMessage.textContent = message
  elements.loadingState.classList.add('hidden')
  elements.searchResults.classList.add('hidden')
  elements.emptyState.classList.add('hidden')
  elements.errorState.classList.remove('hidden')
  elements.pagination.classList.add('hidden')
}

function hideAllStates() {
  elements.loadingState.classList.add('hidden')
  elements.searchResults.classList.add('hidden')
  elements.emptyState.classList.add('hidden')
  elements.errorState.classList.add('hidden')
  elements.searchInfo.classList.add('hidden')
  elements.pagination.classList.add('hidden')
}

function showNotification(message, type = 'info') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }

  const notification = document.createElement('div')
  notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in`
  notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle mr-2"></i>
            ${message}
        </div>
    `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 3000)
}

function exportResults() {
  if (allResults.length === 0) {
    showNotification('Não há resultados para exportar', 'warning')
    return
  }

  const csv = convertToCSV(allResults)
  downloadCSV(
    csv,
    `produtos_${currentQuery}_${new Date().toISOString().split('T')[0]}.csv`,
  )
  showNotification('Resultados exportados com sucesso!', 'success')
}

function convertToCSV(data) {
  const headers = [
    'Código',
    'Descrição',
    'Grupo',
    'Estoque',
    'Local',
    'Parceiro',
    'Status',
    'Relevância',
  ]
  const rows = data.map((item) => [
    item.codprod || '',
    `"${(item.descrprod || '').replace(/"/g, '""')}"`,
    `"${(item.descrgrupoprod || '').replace(/"/g, '""')}"`,
    item.estoque || 0,
    `"${(item.nome_local || '').replace(/"/g, '""')}"`,
    `"${(item.nome_parceiro || '').replace(/"/g, '""')}"`,
    item.ativo === 'S' ? 'Ativo' : 'Inativo',
    item.relevancia || '',
  ])

  return [headers, ...rows].map((row) => row.join(',')).join('\n')
}

function downloadCSV(csv, filename) {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(link.href)
}

// Fechar modal ao pressionar ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal()
  }
})

// Fechar modal ao clicar no fundo
elements.productModal.addEventListener('click', (e) => {
  if (e.target === elements.productModal) {
    closeModal()
  }
})
