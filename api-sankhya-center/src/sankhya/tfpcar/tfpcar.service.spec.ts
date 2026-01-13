import { Test, TestingModule } from '@nestjs/testing'
import { TfpcarService } from './tfpcar.service'
import { SankhyaApiService } from '../shared/sankhya-api.service'

describe('TfpcarService', () => {
  let service: TfpcarService
  let mockSankhyaApiService: jest.Mocked<SankhyaApiService>

  beforeEach(async () => {
    const mockQueryService = {
      executeQuery: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TfpcarService,
        {
          provide: SankhyaApiService,
          useValue: mockQueryService,
        },
      ],
    }).compile()

    service = module.get<TfpcarService>(TfpcarService)
    mockSankhyaApiService = module.get(SankhyaApiService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return paginated result for findAll', async () => {
    mockSankhyaApiService.executeQuery
      .mockResolvedValueOnce([{ CODCARGO: 1, DESCRCARGO: 'Test' }])
      .mockResolvedValueOnce([{ total: 1 }])

    const result = await service.findAll({ page: 1, perPage: 10 })
    expect(result.data).toHaveLength(1)
    expect(result.total).toBe(1)
  })

  it('should handle filters in findAll', async () => {
    mockSankhyaApiService.executeQuery
      .mockResolvedValueOnce([{ CODCARGO: 1, DESCRCARGO: 'Test' }])
      .mockResolvedValueOnce([{ total: 1 }])

    const result = await service.findAll({ page: 1, perPage: 10, ativo: 'S' })
    expect(result.data).toHaveLength(1)
  })

  it('should return entity for findById', async () => {
    mockSankhyaApiService.executeQuery
      .mockResolvedValueOnce([{ CODCARGO: 1, DESCRCARGO: 'Test' }])
      .mockResolvedValueOnce([{ count: 0 }])

    const result = await service.findById(1)
    expect(result).toBeDefined()
    expect(result?.codcargo).toBe(1)
  })

  it('should return null for non-existing findById', async () => {
    mockSankhyaApiService.executeQuery.mockResolvedValueOnce([])

    const result = await service.findById(999)
    expect(result).toBeNull()
  })
})
