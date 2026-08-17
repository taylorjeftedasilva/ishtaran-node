# Ishtaran TypeScript SDK — Exemplos

11 exemplos numerados, código real (nunca pseudocódigo), com `tsc --noEmit` verificado neste
módulo contra o SDK real (`@ishtaran/sdk`, via `file:..`).

| # | Arquivo | Demonstra |
|---|---|---|
| 01 | `01-auth.ts` | Quickstart mínimo |
| 02 | `02-create-account.ts` | Criar Account (Core) |
| 03 | `03-receive-payment-easy.ts` | Receber pagamento (Easy Mode) + `waitForPayment` |
| 04 | `04-create-transaction-core.ts` | Criar Transaction com participantes (Core) |
| 05 | `05-payment-intent-core.ts` | Payment Intent + `depositAddress` real (Core) |
| 06 | `06-settlement.ts` | Liquidar Transaction + resumo (Core) |
| 07 | `07-withdrawal-quote.ts` | Cotar saque, Network Fee sempre visível (Core) |
| 08 | `08-withdrawal.ts` | Executar saque (Easy Mode) + `waitFor` |
| 09 | `09-ledger.ts` | Saldo + Ledger Entries com paginação real (async generator) |
| 10 | `10-webhook-verification.ts` | Verificação de assinatura — **único 100% executável sem API real** |
| 11 | `11-sandbox.ts` | Faucet + confirmação simulada (Sandbox) |

## Rodando

```bash
npm install
export ISHTARAN_API_KEY=...
export ISHTARAN_ORGANIZATION_ID=...
# ... demais variáveis por exemplo, ver o topo de cada arquivo

npx tsx 01-auth.ts
```

O `10-webhook-verification.ts` roda sem nenhuma variável de ambiente real:

```bash
npx tsx 10-webhook-verification.ts
```
