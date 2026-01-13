import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator'

export class ProdutosSimplesV2FindAllDto {
  @ApiPropertyOptional({
    example: 'paper',
    description: 'Search term for product description',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ example: 1, description: 'Page number', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({
    example: 20,
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  perPage?: number = 20

  @ApiPropertyOptional({ example: 'codprod asc', description: 'Sort order' })
  @IsOptional()
  @IsString()
  sort?: string
}
