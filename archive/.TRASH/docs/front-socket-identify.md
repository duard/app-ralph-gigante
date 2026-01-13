# Front-End Socket Identification

Este documento explica como o front-end pode se conectar aos WebSockets da API Sankhya, autenticando-se com JWT. O nome/identificador do usuário vem automaticamente do token JWT, sem necessidade de envio adicional.

## Pré-requisitos

- Instale `socket.io-client`:
  ```bash
  npm install socket.io-client
  ```
- Tenha um token JWT válido obtido via login na API.

## Fluxo Completo

### 1. Fazer Login e Obter Token

Faça uma requisição POST para `/auth/login` com credenciais para obter o token.

```typescript
const login = async (username: string, password: string) => {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    const data = await response.json()
    if (data.token) {
      // Armazene o token (ex: localStorage)
      localStorage.setItem('token', data.token.accessToken)
      return data.token.accessToken
    }
  } catch (error) {
    console.error('Erro no login:', error)
  }
}
```

### 2. Verificar Status da API (Opcional)

Antes de conectar ao WebSocket, verifique se a API está online via HTTP:

```typescript
const checkApiStatus = async () => {
  try {
    const response = await fetch('http://localhost:3000/health')
    const data = await response.json()
    console.log('API Status:', data) // { status: 'ok', timestamp: '...' }
    return response.ok
  } catch (error) {
    console.error('API offline:', error)
    return false
  }
}
```

### 3. Conectar ao WebSocket

Use o token armazenado para conectar. Inclua tratamento de reconexão.

```typescript
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

const connectWebSocket = (token?: string) => {
  if (socket) socket.disconnect() // Desconectar se já conectado

  const options: any = {}
  if (token) {
    options.auth = { token }
    // Ou via query: options.query = { token }
  }

  socket = io('http://localhost:3000', options)

  // Eventos de conexão
  socket.on('connect', () => {
    console.log('WebSocket conectado')
    socket?.emit('ping') // Verificar versão
  })

  socket.on('disconnect', () => {
    console.log('WebSocket desconectado')
  })

  socket.on('connect_error', (error) => {
    console.error('Erro de conexão WebSocket:', error.message)
    // Tentar reconectar após delay
    setTimeout(() => connectWebSocket(token), 5000)
  })

  // Eventos específicos
  socket.on('status', (data) => {
    console.log('Status:', data) // { status: 'ok', timestamp, version }
  })

  socket.on('pong', (data) => {
    console.log('API online, versão:', data.version)
  })

  socket.on('heartbeat', (data) => {
    console.log('Heartbeat:', data.version)
  })

  socket.on('api-status', (data) => {
    console.log('API Status para usuário:', data.user)
  })
}

// Exemplo de uso
const initApp = async () => {
  const token = localStorage.getItem('token') // Opcional
  const isOnline = await checkApiStatus()
  if (isOnline) {
    connectWebSocket(token) // Pode conectar sem token
  }
}
```

### 4. Usar em Requisições HTTP

Para outras requisições, inclua o token no header:

```typescript
const apiRequest = async (endpoint: string) => {
  const token = localStorage.getItem('token')
  const response = await fetch(`http://localhost:3000${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.json()
}
```

### 5. Logout e Limpeza

Ao fazer logout, desconecte o WebSocket e remova o token:

```typescript
const logout = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
  localStorage.removeItem('token')
}
```

## Autenticação

- **Opcional**: Envie o `token` JWT via `auth.token` ou `query.token` para identificar o usuário. Se válido, o backend loga o usuário; caso contrário, conecta como "Visitante".
- Sem token, a conexão é permitida para health checks simples.

## Eventos Recebidos

- `status`: Confirmação inicial com versão.
- `heartbeat`: Pulsação (5s), inclui versão.
- `pong`: Resposta ao `ping`, confirma online.
- `api-status`: Status para usuários autenticados.

## Envio de Eventos

- `ping`: Para verificar conectividade e versão.

## Tratamento de Erros

- Monitore `connect_error` e reconecte automaticamente.
- Para tokens expirados, refaça login.

## Notas

- Use HTTPS em produção.
- Configure CORS no front-end se necessário.
- Teste reconexão em caso de perda de internet.

1. Estoque consignado

Esse estoque se caracteriza por ser mantido por terceiros, através de uma guarda acordada. Isso quer dizer que o são os fornecedores, fabricantes, distribuidores ou importadores dos insumos que abastecem o estoque.

O estoque consignado é formado por um regime de consignação, ou seja, o fornecedor mantém a mercadoria e só a libera mediante compra dos clientes finais.

Toda negociação é estabelecida em contrato e visa agilizar a distribuição dos produtos e expandir canais de vendas. Este tipo de estoque está sendo cada vez mais utilizado, principalmente em empresas que oferecem o modelo de e-commerce. 2. Estoque de antecipação

O estoque de antecipação é muito utilizado para garantir que não faltem produtos que tem fornecimento flutuante. Isso é comum em datas sazonais, em que existe muita demanda de determinado produto ou, em caso contrário, menos oferta por parte dos fornecedores.

Esse tipo de estoque também é conhecido como estoque sazonal, e é comumente usado em datas comemorativas como Natal, Páscoa, Dia das Mães e Dia das Crianças. Além de celebrações, o estoque de antecipação também ajuda em períodos de férias ou datas cíclicas, como volta às aulas. 3. Estoque mínimo

Esse tipo de estoque é utilizado por empresas que já conhecem muito bem a sua demanda. Trata-se de um estoque composto por uma quantidade mínima de produtos, apenas para cobrir possíveis emergências de empresas que trabalham com pedidos de compra.

A maioria das empresas que usam a política de estoque mínimo precisam ter um controle de estoque ainda mais rigoroso, já que, quando a quantidade de produtos armazenados está acabando, é necessário realizar novas compras.

Nesse tipo de estoque, só existe quantidade suficiente de produtos para cobrir a demanda durante o tempo em que espera o fornecedor fazer a entrega de novos itens.

Cada empresa define a quantidade adequada de produtos no estoque mínimo e não há certo ou errado. As necessidades da indústria são diferentes do varejo, por exemplo. Um precisa observar volumes de insumos, enquanto o outro, de produtos à pronta entrega. 4. Estoque de proteção

O intuito da manutenção desse estoque é compensar demandas que ultrapassam o esperado, ou para suprir possíveis falhas de fornecimento, dando uma margem de segurança para a falta de produtos em estoque.

É aconselhável que qualquer tipo de empresa tenha estoques de proteção para evitar riscos de abastecimento que possam prejudicar as vendas. Afinal, nunca se sabe quando podem acontecer greves, mudanças na legislação, entre outros.

O estoque de proteção também funciona como uma prevenção e defesa de ofertas e preços, quando compra-se volumes antecipados para garantir negociações.

Mesmo que esse tipo de estoque aumente os custos de armazenamento, pode valer a pena, já que os preços de matéria-prima e insumos podem sofrer variações conforme a inflação, por exemplo.

Sendo assim, é prudente manter estoques de proteção para produtos com maior demanda. O controle de estoque nesse caso ajuda na definição da quantidade ideal de itens e produtos. 5. Estoque de ciclo

Utilizado por empresas que possuem operações mais complexas, o estoque de ciclo serve para armazenar os produtos de cada etapa do ciclo produtivo de determinado item.

Isso significa que existem ciclos de vendas, que se iniciam, crescem e acabam. Como é o caso do segmento de moda, por exemplo. A cada estação, as necessidades dos clientes mudam e, consequentemente, os produtos também.

Empresas que optam pelo estoque de ciclo devem ter um controle de estoque muito atento, já que é mais difícil gerenciá-lo. É preciso atenção para não ter perdas por excesso de estoque ou falta de vendas por insuficiência de mercadorias.
Mas qual desses tipos de estoque é o ideal para o negócio?

Antes de responder essa pergunta, você deve avaliar:

    O seu segmento;
    Espaço físico disponível para armazenagem;
    Se os seus produtos estão sujeitos a sazonalidades;
    Sua relação com fornecedores.
    Se o modelo de estoque faz sentido para o seu negócio.

O importante é manter um estoque que não seja muito maior do que sua demanda, nem enxuto demais a ponto de não conseguir suprir as necessidades da sua empresa.

E antes que você aprenda como fazer um controle de estoque, é importante que você entenda a relação entre o controle de estoque e o capital de giro de uma empresa.
Banner promocional do WMS da Sankhya. Texto principal em verde destaca 'Navegue pelo WMS da Sankhya'. Descrição informa que o sistema WMS aumenta a eficiência do armazém, auxiliando na gestão de recebimento, separação, conferência e inventário de mercadorias. Botão verde com CTA 'Navegar pelo WMS'. Imagem de um tablet exibindo a interface do sistema WMS, acompanhada de ilustrações de um caminhão e um centro logístico.
Métodos de controle de estoque: como escolher o ideal para o seu negócio

Saber o que é controle de estoque e como fazer um controle eficiente é fundamental para qualquer empresa que deseja reduzir custos, evitar perdas e garantir disponibilidade de produtos. Na Sankhya, entendemos que cada operação tem desafios únicos. Por isso, reunimos os principais métodos de controle de estoque usados no mercado para ajudar você a tomar decisões mais inteligentes.
PEPS (Primeiro a Entrar, Primeiro a Sair – FIFO)

O método PEPS é ideal para empresas que trabalham com produtos perecíveis ou com validade, como alimentos e medicamentos. Ele garante que os itens mais antigos saiam primeiro, evitando perdas e mantendo a qualidade.
UEPS (Último a Entrar, Primeiro a Sair – LIFO)

Apesar de não ser aceito para fins fiscais no Brasil, o UEPS pode ser útil em segmentos com produtos não perecíveis e variações de preço frequentes, refletindo o custo mais recente no resultado financeiro.
Custo Médio

Neste método, o valor do estoque é calculado pela média ponderada dos custos. É ideal para empresas que lidam com grandes volumes de itens similares, como atacadistas e distribuidoras, facilitando o controle e a precificação.
Curva ABC

A Curva ABC classifica os produtos por importância:

    A: itens de alto valor ou giro
    B: itens intermediários
    C: itens de menor valor ou giro

Essa análise permite focar recursos nos produtos que mais impactam seus resultados.
Just in Time

O método Just in Time busca manter o estoque no nível mínimo necessário, com reposição sincronizada à demanda. Ideal para indústrias com processos bem definidos e fornecedores confiáveis, ele reduz custos de armazenagem e aumenta a eficiência.
Giro de Estoque

Esse indicador mostra quantas vezes o estoque é renovado em determinado período. Um giro de estoque alto indica eficiência; um giro baixo pode apontar excesso e risco de perdas.
Como fazer controle de estoque eficiente?

O segredo está em entender o perfil do seu negócio, o tipo de produto e os objetivos da empresa. Em muitos casos, a combinação de métodos é o melhor caminho. Com o ERP Sankhya, você pode automatizar todos esses métodos, integrando setores e acessando dados em tempo real para tomar decisões mais estratégicas.
Controle de estoque x capital de giro: qual a diferença?

Segundo o Sebrae, o capital de giro de uma empresa é uma reserva de dinheiro com a quantia necessária para manter as operações dela funcionando. Para calculá-lo, é preciso fazer a seguinte operação:
(Valor de Contas a Receber + Valor em Estoque) – Valor das Contas a Pagar

Resumidamente, o capital de giro é o valor necessário para que a empresa cumpra os compromissos financeiros de curtíssimo prazo.

É aconselhável que toda empresa tenha o capital de giro já estabelecido no planejamento financeiro, pois ele está diretamente ligado ao fluxo de caixa, que determina quando devem ser feitos os pagamentos de curto prazo.

Já o controle de estoque deve ser bem feito porque o estoque pode ser transformado em dinheiro no curto prazo. Portanto, é considerado um ativo da empresa, já que a venda dos produtos em estoque contribuem, de alguma forma, para o pagamento das obrigações do negócio.

Lembramos que o estoque não tem a mesma liquidez do dinheiro e a empresa pode ter dificuldades em transformá-lo em recursos financeiros imediatos, por isso a importância de uma boa gestão de estoque.
Como fazer controle de estoque?
Profissional fazendo o controle de estoque através de um tablet

Agora que você já sabe por que é importante fazer o controle de estoque, quais são os impactos em um negócio e quais são os principais tipos de estoque, vamos responder a pergunta que realmente interessa: como fazer controle de estoque? Separamos 5 dicas para te ajudar.

1. Organize o espaço físico do estoque

Antes de implantar qualquer outro método de controle, é importante que você organize o espaço que você utiliza para armazenar mercadorias.

Escolha o lugar dos produtos levando em conta suas particularidades de armazenagem, origem e giro. Determine, também, quais pessoas podem ou não ter acesso ao estoque e, principalmente, mantenha o espaço sempre limpo. 2. Faça um inventário

Tão importante quanto organizar o espaço de armazenagem para o controle de estoque, é construir um inventário que contenha informações claras sobre os itens disponíveis e mantê-lo sempre atualizado.

É importante manter esse inventário documentado com a data de atualização e acessível de maneira eletrônica, mesmo se ele for feito à mão, porque isso facilita o acesso aos dados.

Atenção: aconselhamos que mantenha sempre backups do inventário, afinal, você não quer que essas informações se percam, certo?

Com o inventário em mãos, você pode verificar de maneira fácil quais são os produtos que estão faltando no estoque ou quais estão sobrando. Assim, você pode antecipar compras, prever demandas e, o principal, controlar de maneira eficaz a entrada e a saída de produtos. 3. Utilize fichas de estoque

Um dos métodos mais recomendados para fazer controle de estoque é a utilização de fichas de estoque, conhecido também como Kardex. Elas servem para controlar a circulação individual de um tipo específico de produto e pode ser informatizada ou impressa.

O importante é que a ficha contenha:

    A descrição do produto;
    Sua unidade de controle;
    O estoque mínimo;
    A localização no armazém;
    As datas de entrada e saída com as respectivas quantidades;
    O valor de custo de entrada/saída;
    O saldo de estoque.
