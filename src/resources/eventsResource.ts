import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, postRequest } from '../http/types.js';
import { resolveIdempotencyKey } from '../idempotency/idempotencyKeyGenerator.js';
import { EventIngestionResult, mapEventIngestionResult } from '../model/workflow.js';
import { EnumValue } from '../model/enumFactory.js';

/** Data Plane — `Events` (1 rota real: ingestão, mesmo módulo `WorkflowRules`). */
export class EventsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  ingest(
    applicationId: string,
    workflowVersionId: string,
    currentStateId: string,
    transactionReference: string,
    eventTypeId: string,
    eventSource: EnumValue<number>,
    payload: Record<string, string> | undefined,
    idempotencyKey?: string,
  ): Promise<EventIngestionResult> {
    const body = this.toJson({
      workflowVersionId, currentStateId, transactionReference, eventTypeId,
      idempotencyKey: resolveIdempotencyKey(idempotencyKey),
      payload: payload ?? null,
      eventSource: eventSource.rawValue,
    });
    return this.execute(postRequest(`/v1/applications/${applicationId}/events`, body, true), mapEventIngestionResult);
  }
}
