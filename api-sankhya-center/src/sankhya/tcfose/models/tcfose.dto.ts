import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'

export class OrdemServicoFindAllDto {
  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsString()
  manutencao?: string

  @IsOptional()
  @IsString()
  tipo?: string

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  codveiculo?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  codparc?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  codtec?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  prioridade?: number

  @IsOptional()
  @IsDateString()
  dtInicio?: string

  @IsOptional()
  @IsDateString()
  dtFim?: string

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  perPage?: number

  @IsOptional()
  @IsString()
  sort?: string
}

export class CreateOrdemServicoDto {
  @IsNumber()
  codparc: number

  @IsOptional()
  @IsNumber()
  codequip?: number

  @IsOptional()
  @IsString()
  defeito?: string

  @IsOptional()
  @IsString()
  observacao?: string

  @IsOptional()
  @IsNumber()
  codtec?: number

  @IsNumber()
  prioridade: number

  @IsOptional()
  @IsString()
  tipo?: string

  @IsOptional()
  @IsDateString()
  dtpreventrega?: string
}

export class UpdateOrdemServicoDto {
  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsString()
  solucao?: string

  @IsOptional()
  @IsString()
  observacao?: string

  @IsOptional()
  @IsNumber()
  codtec?: number

  @IsOptional()
  @IsNumber()
  prioridade?: number

  @IsOptional()
  @IsDateString()
  dtpreventrega?: string

  @IsOptional()
  @IsDateString()
  dtencerramento?: string
}

export class AddItemOSDto {
  @IsNumber()
  codprod: number

  @IsNumber()
  qtdneg: number

  @IsNumber()
  vlrunit: number

  @IsString()
  tipo: string

  @IsOptional()
  @IsString()
  observacao?: string
}
