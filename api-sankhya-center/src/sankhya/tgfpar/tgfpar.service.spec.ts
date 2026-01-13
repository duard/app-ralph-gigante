import { Test, TestingModule } from '@nestjs/testing'
import { TgfparService } from './tgfpar.service'
import { SankhyaApiService } from '../shared/sankhya-api.service'

describe('TgfparService', () => {
  let service: TgfparService
  let mockSankhyaApiService: jest.Mocked<SankhyaApiService>

  beforeEach(async () => {
    const mockQueryService = {
      executeQuery: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TgfparService,
        {
          provide: SankhyaApiService,
          useValue: mockQueryService,
        },
      ],
    }).compile()

    service = module.get<TgfparService>(TgfparService)
    mockSankhyaApiService = module.get(SankhyaApiService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return paginated result for findAll', async () => {
    mockSankhyaApiService.executeQuery
      .mockResolvedValueOnce([{ CODPARC: 1, NOMEPARC: 'Test' }])
      .mockResolvedValueOnce([{ total: 1 }])

    const result = await service.findAll({ page: 1, perPage: 10 })
    expect(result.data).toHaveLength(1)
    expect(result.total).toBe(1)
  })

  it('should return entity for findById', async () => {
    mockSankhyaApiService.executeQuery.mockResolvedValueOnce([
      { CODPARC: 1, NOMEPARC: 'Test' },
    ])

    const result = await service.findById(1)
    expect(result).toBeDefined()
    expect(result?.codparc).toBe(1)
  })
})
