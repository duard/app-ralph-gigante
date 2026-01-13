

/*


  
--  
--  select top(100) ATUALEST, *
--  
--  from TGFTOP ;
--  
--  

select TOP(10) *

from TGFEST

ORDER BY CODPROD desc;

--TGFSER
	
  */
select distinct
  ATUALEST
from SANKHYA_PROD.sankhya.tgftop
order by ATUALEST;


select
  C.NOMETAB,
  C.NOMECAMPO,
  O.OPCAO,
  O.*
from SANKHYA_PROD.sankhya.TDDCAM C
  join SANKHYA_PROD.sankhya.TDDOPC O
  on O.NUCAMPO = C.NUCAMPO
where C.NOMETAB = 'TGFTOP'
  and C.NOMECAMPO = 'ATUALEST'
order by O.OPCAO;
-- TGFTOP	ATUALEST	Baixar	860	B	Baixar	NULL	NULL	0	mge
-- TGFTOP	ATUALEST	Entrar	860	E	Entrar	NULL	NULL	0	mge
-- TGFTOP	ATUALEST	Nenhuma	860	N	Nenhuma	NULL	NULL	0	mge
-- TGFTOP	ATUALEST	Reservar	860	R	Reservar	NULL	NULL	0	mge



select
  C.NOMETAB,
  C.NOMECAMPO,
  O.OPCAO,
  O.*
from SANKHYA_PROD.sankhya.TDDCAM C
  join SANKHYA_PROD.sankhya.TDDOPC O
  on O.NUCAMPO = C.NUCAMPO
where C.NOMETAB = 'TGFEST'
  and C.NOMECAMPO = 'TIPO'
order by O.OPCAO;