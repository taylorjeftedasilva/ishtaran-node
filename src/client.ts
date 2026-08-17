import { buildClientConfig, IshtaranClientConfigInput } from './config/clientConfig.js';
import { HttpTransport } from './http/types.js';
import { FetchHttpTransport } from './http/fetchTransport.js';
import { AuthenticatingTransport } from './http/authenticatingTransport.js';
import { RetryingTransport } from './http/retryingTransport.js';
import { LoggingTransport } from './http/loggingTransport.js';
import { BearerTokenHolder } from './auth/bearerTokenHolder.js';
import { AuthResource } from './resources/authResource.js';
import { OrganizationsResource } from './resources/organizationsResource.js';
import { ApplicationsResource } from './resources/applicationsResource.js';
import { EnvironmentsResource } from './resources/environmentsResource.js';
import { ApiKeysResource } from './resources/apiKeysResource.js';
import { MembersResource } from './resources/membersResource.js';
import { AssetNetworkCatalogResource } from './resources/assetNetworkCatalogResource.js';
import { AccountsResource } from './resources/accountsResource.js';
import { TransactionsResource } from './resources/transactionsResource.js';
import { DepositsResource } from './resources/depositsResource.js';
import { LedgerResource } from './resources/ledgerResource.js';
import { SettlementsResource } from './resources/settlementsResource.js';
import { RefundsResource } from './resources/refundsResource.js';
import { WithdrawalsResource } from './resources/withdrawalsResource.js';
import { WorkflowsResource } from './resources/workflowsResource.js';
import { EventTypesResource } from './resources/eventTypesResource.js';
import { EventsResource } from './resources/eventsResource.js';
import { SandboxResource } from './resources/sandboxResource.js';
import { WebhookEndpointsResource } from './resources/webhookEndpointsResource.js';
import { WebhookDeliveriesResource } from './resources/webhookDeliveriesResource.js';
import { BalanceResponse, ParticipantInput, WithdrawalResponse } from './model/dataPlane.js';
import { PaymentIntentStatus, TransactionStatus } from './model/enums.js';
import { verifyWebhookSignature } from './webhook/webhookSignatureVerifier.js';
import { RetryPolicy, disabledRetryPolicy } from './config/retryPolicy.js';
import { pollUntil } from './util/polling.js';

export interface EasyWithdrawResult {
  withdrawalId: string;
  requestedAmount: string;
  estimatedNetworkFee: string;
  estimatedRecipientAmount: string;
  status: WithdrawalResponse['status'];
}

export interface EasyPaymentResult {
  transactionId: string;
  paymentIntentId: string;
  transactionStatus: ReturnType<typeof TransactionStatus.fromRaw>;
  paymentIntentStatus: ReturnType<typeof PaymentIntentStatus.fromRaw>;
  depositAddress: string | null;
  amount: string;
}

/**
 * Fachada pública única do SDK. Compõe Core (`resources.*`) e Easy Mode sobre o MESMO transporte
 * HTTP — Easy Mode nunca duplica lógica de negócio, só combina chamadas Core (ver
 * SDK_CAPABILITY_SPEC.md §5).
 */
export class IshtaranClient {
  readonly auth: AuthResource;
  readonly organizations: OrganizationsResource;
  readonly applications: ApplicationsResource;
  readonly environments: EnvironmentsResource;
  readonly apiKeys: ApiKeysResource;
  readonly members: MembersResource;
  readonly assetNetworkCatalog: AssetNetworkCatalogResource;
  readonly accounts: AccountsResource;
  readonly transactions: TransactionsResource;
  readonly deposits: DepositsResource;
  readonly ledger: LedgerResource;
  readonly settlements: SettlementsResource;
  readonly refunds: RefundsResource;
  readonly withdrawals: WithdrawalsResource;
  readonly workflows: WorkflowsResource;
  readonly eventTypes: EventTypesResource;
  readonly events: EventsResource;
  readonly sandbox: SandboxResource;
  readonly webhookEndpoints: WebhookEndpointsResource;
  readonly webhookDeliveries: WebhookDeliveriesResource;

  private constructor(rawTransport: HttpTransport, apiKey: string | undefined, retryPolicy: RetryPolicy) {
    const bearerTokenHolder = new BearerTokenHolder();
    const authenticated = new AuthenticatingTransport(rawTransport, apiKey, bearerTokenHolder);
    const transport = new RetryingTransport(authenticated, retryPolicy);

    this.auth = new AuthResource(transport, bearerTokenHolder);
    this.organizations = new OrganizationsResource(transport);
    this.applications = new ApplicationsResource(transport);
    this.environments = new EnvironmentsResource(transport);
    this.apiKeys = new ApiKeysResource(transport);
    this.members = new MembersResource(transport);
    this.assetNetworkCatalog = new AssetNetworkCatalogResource(transport);
    this.accounts = new AccountsResource(transport);
    this.transactions = new TransactionsResource(transport);
    this.deposits = new DepositsResource(transport);
    this.ledger = new LedgerResource(transport);
    this.settlements = new SettlementsResource(transport);
    this.refunds = new RefundsResource(transport);
    this.withdrawals = new WithdrawalsResource(transport);
    this.workflows = new WorkflowsResource(transport);
    this.eventTypes = new EventTypesResource(transport);
    this.events = new EventsResource(transport);
    this.sandbox = new SandboxResource(transport);
    this.webhookEndpoints = new WebhookEndpointsResource(transport);
    this.webhookDeliveries = new WebhookDeliveriesResource(transport);
  }

  static create(input: IshtaranClientConfigInput): IshtaranClient {
    const config = buildClientConfig(input);
    let transport: HttpTransport = new FetchHttpTransport(config);
    if (config.loggingEnabled) {
      transport = new LoggingTransport(transport);
    }
    return new IshtaranClient(transport, config.apiKey, config.retryPolicy);
  }

  /**
   * Construtor alternativo para testes — injeta um {@link HttpTransport} falso (sem rede), sem
   * retry (já tem suíte própria dedicada — `retryingTransport.test.ts`).
   */
  static forTesting(transport: HttpTransport): IshtaranClient {
    return new IshtaranClient(transport, undefined, disabledRetryPolicy());
  }

  // ---- Easy Mode ----

  /** Passagem direta para `ledger.getBalance()` — sem transformação de negócio (SDK_CAPABILITY_SPEC.md §5). */
  getBalance(accountId: string, assetNetworkId: string): Promise<BalanceResponse> {
    return this.ledger.getBalance(accountId, assetNetworkId);
  }

  /**
   * Compõe `withdrawals.createDestination()` (se necessário) + `.request()` — nunca esconde a
   * Network Fee, sempre devolve o `withdrawalId` real do Core.
   */
  async withdraw(
    organizationId: string,
    accountId: string,
    assetNetworkId: string,
    amount: string,
    destinationAddress: string,
    existingDestinationId: string | undefined,
  ): Promise<EasyWithdrawResult> {
    let destinationId = existingDestinationId;
    if (!destinationId) {
      const destination = await this.withdrawals.createDestination(organizationId, destinationAddress, assetNetworkId);
      destinationId = destination.withdrawalDestinationId;
    }
    const result = await this.withdrawals.request(organizationId, accountId, destinationId, assetNetworkId, amount);
    return {
      withdrawalId: result.withdrawalId,
      requestedAmount: result.amount,
      estimatedNetworkFee: result.estimatedNetworkFee,
      estimatedRecipientAmount: result.estimatedRecipientAmount,
      status: result.status,
    };
  }

  /**
   * Compõe `transactions.create()` + `deposits.createPaymentIntent()` + um GET de acompanhamento
   * para obter o `depositAddress` real (só exposto pelo GET dedicado, não pelo POST de criação).
   */
  async receivePayment(
    organizationId: string,
    applicationId: string,
    payerAccountId: string,
    recipientAccountId: string,
    assetNetworkId: string,
    amount: string,
  ): Promise<EasyPaymentResult> {
    const participants: ParticipantInput[] = [
      { accountId: payerAccountId, role: 'payer', isPayer: true },
      { accountId: recipientAccountId, role: 'recipient', isPayer: false },
    ];
    const createdTransaction = await this.transactions.create(organizationId, applicationId, null, assetNetworkId, amount, participants);
    const createdPaymentIntent = await this.deposits.createPaymentIntent(organizationId, createdTransaction.transactionId, assetNetworkId, amount, undefined);
    return this.getPayment(createdTransaction.transactionId, createdPaymentIntent.paymentIntentId);
  }

  async getPayment(transactionId: string, paymentIntentId: string): Promise<EasyPaymentResult> {
    const [transaction, paymentIntent] = await Promise.all([
      this.transactions.get(transactionId),
      this.deposits.getPaymentIntent(paymentIntentId),
    ]);
    return {
      transactionId,
      paymentIntentId,
      transactionStatus: transaction.status,
      paymentIntentStatus: paymentIntent.status,
      depositAddress: paymentIntent.depositAddress,
      amount: transaction.amount,
    };
  }

  /**
   * Polling seguro — nunca infinito, sempre com `timeoutMs`/`pollIntervalMs` explícitos. Termina
   * quando o Payment Intent sai de `PENDING`/`PARTIALLY_PAID`.
   */
  waitForPayment(transactionId: string, paymentIntentId: string, timeoutMs: number, pollIntervalMs: number): Promise<EasyPaymentResult> {
    return pollUntil(
      () => this.getPayment(transactionId, paymentIntentId),
      (r) => r.paymentIntentStatus.rawValue !== PaymentIntentStatus.PENDING!.rawValue
        && r.paymentIntentStatus.rawValue !== PaymentIntentStatus.PARTIALLY_PAID!.rawValue,
      timeoutMs,
      pollIntervalMs,
      `paymentIntentId=${paymentIntentId}`,
    );
  }

  /** Sem chamada HTTP — cálculo local (ver SDK_CAPABILITY_SPEC.md §10). */
  verifyWebhookSignature(rawBody: string, signatureHeader: string, timestampHeader: string, endpointSecret: string): boolean {
    return verifyWebhookSignature(rawBody, signatureHeader, timestampHeader, endpointSecret);
  }
}
