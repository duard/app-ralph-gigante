import { IsOptional, IsString, Min } from 'class-validator'
import { Type, Transform } from 'class-transformer'

/**
 * DTO base para operações de listagem com paginação, ordenação e seleção de campos.
 */
export class BaseFindAllDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Transform(({ value }) => value || 10)
  perPage: number = 10

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Transform(({ value, obj }) => {
    if (value) {
      // If pageSize is provided, use it as perPage
      obj.perPage = value
    }
    return value
  })
  pageSize?: number

  @IsOptional()
  @IsString()
  sort?: string

  @IsOptional()
  @IsString()
  fields?: string
}
