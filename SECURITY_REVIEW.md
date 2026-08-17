# SECURITY_REVIEW.md — Ishtaran TypeScript/Node.js SDK

Checklist do §57 do brief do SDK Program. Mesma disciplina do Java: cada item com evidência real
(teste ou leitura de código), nunca assumido.

| # | Item | Status | Evidência |
|---|---|---|---|
| 1 | Secrets nunca logados | ✅ PASS | `loggingTransport.test.ts` — `redactedHeaders` nunca expõe API Key/Authorization em texto puro |
| 2 | API Key nunca na URL/querystring | ✅ PASS | `AuthenticatingTransport` só anexa via header; nenhum resource constrói URL com a chave |
| 3 | TLS verificado por padrão | ✅ PASS | `fetch` nativo do Node verifica certificado por padrão; nenhum switch de desabilitar exposto por este SDK |
| 4 | Comparação de assinatura de webhook em tempo constante | ✅ PASS | `node:crypto.timingSafeEqual` real (não `===`) — `webhookSignatureVerifier.test.ts` (7 testes, incluindo vetor calculado independentemente via `node:crypto` direto e via Python/hmac na versão Java) |
| 5 | Retries seguros (nunca cegos em mutação não-idempotente) | ✅ PASS | `retryingTransport.test.ts` — nunca retry em 400/401/403/404/409/422; 5xx só com idempotência/GET |
| 6 | Timeout obrigatório, nunca infinito | ✅ PASS | `AbortSignal.timeout(requestTimeoutMs)` sempre aplicado; defaults finitos (`clientConfig.test.ts`) |
| 7 | Redação central em logging opt-in | ✅ PASS | `LoggingTransport` nunca loga corpo bruto, só método/path/status/duração |
| 8 | Dependências mínimas, escaneadas | ✅ PASS | 1 dependência de produção (`lossless-json`, madura/popular). `npm audit` roda 0 vulnerabilidades na árvore de produção; 1 vulnerabilidade `low` restante é exclusivamente dev (`esbuild`, usado só pelo bundler `tsup`, nunca embarcado no pacote publicado) |
| 9 | Dinheiro nunca perde precisão | ✅ PASS | `json.test.ts` — `lossless-json` preserva o texto exato do número; teste explícito confirmando que `JSON.parse` nativo TERIA perdido essa precisão (prova que o problema é real, não hipotético) |
| 10 | Resposta maliciosa/malformada nunca derruba o client | ✅ PASS | `errorMapper.test.ts` — corpo malformado nunca lança erro de parsing; enums desconhecidos nunca lançam (`enums.test.ts`) |
| 11 | Corpo de resposta com tamanho ilimitado | ⚠️ **LIMITAÇÃO REAL, NÃO CORRIGIDA** | `fetch`/`response.text()` buferiza a resposta inteira em memória sem limite configurável nesta versão. Mesma limitação documentada no SDK Java — ver "Limitações conhecidas" |
| 12 | Desserialização segura | ✅ PASS | `lossless-json`/`JSON.parse` nunca fazem desserialização polimórfica/reflection-based — sempre produzem dados estruturais simples, mapeados manualmente para tipos conhecidos |
| 13 | URL controlada pelo usuário / SSRF | ✅ PASS | `baseUrl` sempre explícito e fixado na construção do client — nenhum método de negócio aceita override de URL (verificado: nenhum método em `resources/*.ts` recebe parâmetro de URL) |
| 14 | Comportamento de redirecionamento HTTP | ✅ PASS (corrigido nesta revisão) | `FetchHttpTransport` usa `redirect: 'manual'` e trata qualquer 3xx como `NetworkError` — nunca segue automaticamente, agora com paridade real com o `Redirect.NEVER` do Java. Ver "Achado corrigido" abaixo |
| 15 | Injeção de header | ✅ PASS | `fetch` nativo valida nomes/valores de header (rejeita CR/LF) — nunca construído por concatenação de string crua |
| 16 | Injeção de query string | ✅ PASS | Todo valor de query string livre (não-enum) passa por `URLSearchParams`, que URL-encoda automaticamente — `webhookEndpointsResource.test.ts` confirma que `eventType` com `&`/`=` embutidos nunca injeta um parâmetro extra. **Melhor postura que o Java nesta versão** (o Java precisou de uma correção manual para o mesmo caso; TypeScript usa `URLSearchParams` desde o início, fechando essa classe de risco por construção) |
| 17 | Comportamento de proxy | N/A | Não aplicável — nenhuma configuração de proxy customizada exposta; `fetch` usa o comportamento padrão do runtime |

## Achado corrigido durante esta revisão

**`fetch` nativo seguiria redirects HTTP automaticamente por padrão** (`redirect: 'follow'` é o
default do WHATWG fetch) — diferente do `java.net.http.HttpClient` do SDK Java, que usa
`Redirect.NEVER` por padrão. Um redirect 3xx malicioso vindo de um `baseUrl` comprometido teria
sido seguido automaticamente. Corrigido nesta sessão: `FetchHttpTransport` agora usa
`redirect: 'manual'` e trata qualquer 3xx como `NetworkError`, restaurando paridade real com o
Java. Coberto por `fetchTransport.test.ts` (mock de `fetch` confirmando `redirect: 'manual'` é
passado e que um 302 lança `NetworkError`).

## Limitações conhecidas (documentadas, não escondidas)

1. **Corpo de resposta sem limite de tamanho** (item 11) — mesma limitação do SDK Java, mesma
   justificativa (risco só existe se `baseUrl` apontar para um host comprometido).
2. **`connectTimeoutMs` não imposto separadamente** de `requestTimeoutMs` (ver `CONFIGURATION.md`)
   — não é um item de segurança per se, mas afeta a paridade de comportamento sob rede lenta/DoS
   por conexão pendurada.

## Veredito

**PASS**, com 2 limitações documentadas explicitamente (nunca escondidas) — nenhum achado crítico
ou de alta severidade permanece sem correção ou sem justificativa registrada; o único achado real
de comportamento (redirects seguidos automaticamente) foi corrigido, não apenas anotado.
