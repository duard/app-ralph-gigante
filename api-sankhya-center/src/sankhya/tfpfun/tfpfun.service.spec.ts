import { Test, TestingModule } from '@nestjs/testing'
import { TfpfunService } from './tfpfun.service'
import { SankhyaApiService } from '../shared/sankhya-api.service'

describe('TfpfunService', () => {
  let service: TfpfunService
  let mockSankhyaApiService: jest.Mocked<SankhyaApiService>

  beforeEach(async () => {
    const mockQueryService = {
      executeQuery: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TfpfunService,
        {
          provide: SankhyaApiService,
          useValue: mockQueryService,
        },
      ],
    }).compile()

    service = module.get<TfpfunService>(TfpfunService)
    mockSankhyaApiService = module.get(SankhyaApiService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return paginated result', async () => {
    mockSankhyaApiService.executeQuery
      .mockResolvedValueOnce([{ CODFUNC: 1, NOMEFUNC: 'Test' }])
      .mockResolvedValueOnce([{ total: 1 }])

    const result = await service.findAll({ page: 1, perPage: 10 })
    expect(result.data).toHaveLength(1)
    expect(result.total).toBe(1)
  })
})
