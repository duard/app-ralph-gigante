export const findByIdQuery = `
SELECT
    v.*,
    LTRIM(RTRIM(v.MARCAMODELO)) AS Nome,
    LTRIM(RTRIM(ISNULL(v.AD_TIPOEQPTO, v.CATEGORIA))) AS Categoria
FROM SANKHYA.TGFVEI v
WHERE v.CODVEICULO = @codVeiculo
`;
