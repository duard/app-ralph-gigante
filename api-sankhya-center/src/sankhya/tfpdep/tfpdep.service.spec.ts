import { Test, TestingModule } from '@nestjs/testing'
import { TfpdepService } from './tfpdep.service'
import { SankhyaApiService } from '../shared/sankhya-api.service'

describe('TfpdepService', () => {
  let service: TfpdepService
  let mockSankhyaApiService: jest.Mocked<SankhyaApiService>

  beforeEach(async () => {
    const mockQueryService = {
      executeQuery: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TfpdepService,
        {
          provide: SankhyaApiService,
          useValue: mockQueryService,
        },
      ],
    }).compile()

    service = module.get<TfpdepService>(TfpdepService)
    mockSankhyaApiService = module.get(SankhyaApiService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return paginated result for findAll', async () => {
    mockSankhyaApiService.executeQuery
      .mockResolvedValueOnce([{ CODDEP: 1, DESCRDEP: 'Test' }])
      .mockResolvedValue([{ total: 1 }])

    const result = await service.findAll({ page: 1, perPage: 10 })
    expect(result).toBeDefined()
    expect(result.data).toHaveLength(1)
    expect(result.total).toBe(1)
    expect(mockSankhyaApiService.executeQuery).toHaveBeenCalledTimes(3)
  })

  it('should return entity for findById', async () => {
    mockSankhyaApiService.executeQuery
      .mockResolvedValueOnce([{ CODDEP: 1, DESCRDEP: 'Test' }])
      .mockResolvedValueOnce([{ count: 0 }])

    const result = await service.findById(1)
    expect(result).toBeDefined()
    expect(result?.coddep).toBe(1)
  })
})
