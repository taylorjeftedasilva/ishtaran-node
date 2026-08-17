import { arrayField, field, stringField, stringFieldOrNull } from '../resources/resourceSupport.js';
import { EnumValue } from './enumFactory.js';
import { ConditionOperator } from './enums.js';

export interface ConditionInput {
  field: string;
  operator: EnumValue<number>;
  expectedValue: string;
}

export interface ConditionResponse {
  field: string | null;
  operator: EnumValue<number>;
  expectedValue: string | null;
}

function mapCondition(raw: unknown): ConditionResponse {
  return {
    field: stringFieldOrNull(raw, 'field'),
    operator: ConditionOperator.fromRaw(Number(field(raw, 'operator'))),
    expectedValue: stringFieldOrNull(raw, 'expectedValue'),
  };
}

export interface StateInput {
  id: string;
  name: string;
  isInitial: boolean;
  isFinal: boolean;
}

export interface StateResponse {
  stateId: string;
  name: string | null;
  isInitial: boolean;
  isFinal: boolean;
}

function mapState(raw: unknown): StateResponse {
  return {
    stateId: stringFieldOrNull(raw, 'stateId')!,
    name: stringFieldOrNull(raw, 'name'),
    isInitial: Boolean(field(raw, 'isInitial')),
    isFinal: Boolean(field(raw, 'isFinal')),
  };
}

export interface TransitionInput {
  id: string;
  fromStateId: string;
  toStateId: string;
}

export interface TransitionResponse {
  transitionId: string;
  fromStateId: string;
  toStateId: string;
}

function mapTransition(raw: unknown): TransitionResponse {
  return {
    transitionId: stringFieldOrNull(raw, 'transitionId')!,
    fromStateId: stringFieldOrNull(raw, 'fromStateId')!,
    toStateId: stringFieldOrNull(raw, 'toStateId')!,
  };
}

export interface RuleResponse {
  ruleId: string;
  fromStateId: string;
  toStateId: string;
  eventTypeId: string;
  conditions: ConditionResponse[];
}

function mapRule(raw: unknown): RuleResponse {
  return {
    ruleId: stringFieldOrNull(raw, 'ruleId')!,
    fromStateId: stringFieldOrNull(raw, 'fromStateId')!,
    toStateId: stringFieldOrNull(raw, 'toStateId')!,
    eventTypeId: stringFieldOrNull(raw, 'eventTypeId')!,
    conditions: arrayField(raw, 'conditions', mapCondition),
  };
}

export interface WorkflowResponse {
  workflowId: string;
  organizationId: string;
  name: string | null;
  status: string | null;
  createdAt: string;
  versionIds: string[];
}

export function mapWorkflowResponse(raw: unknown): WorkflowResponse {
  return {
    workflowId: stringFieldOrNull(raw, 'workflowId')!,
    organizationId: stringFieldOrNull(raw, 'organizationId')!,
    name: stringFieldOrNull(raw, 'name'),
    status: stringFieldOrNull(raw, 'status'),
    createdAt: stringField(raw, 'createdAt'),
    versionIds: arrayField(raw, 'versionIds', (x) => String(x)),
  };
}

export interface WorkflowVersionResponse {
  workflowVersionId: string;
  workflowId: string;
  status: string | null;
  createdAt: string;
  publishedAt: string | null;
  states: StateResponse[];
  transitions: TransitionResponse[];
  rules: RuleResponse[];
}

export function mapWorkflowVersionResponse(raw: unknown): WorkflowVersionResponse {
  return {
    workflowVersionId: stringFieldOrNull(raw, 'workflowVersionId')!,
    workflowId: stringFieldOrNull(raw, 'workflowId')!,
    status: stringFieldOrNull(raw, 'status'),
    createdAt: stringField(raw, 'createdAt'),
    publishedAt: stringFieldOrNull(raw, 'publishedAt'),
    states: arrayField(raw, 'states', mapState),
    transitions: arrayField(raw, 'transitions', mapTransition),
    rules: arrayField(raw, 'rules', mapRule),
  };
}

export interface EventTypeResponse {
  eventTypeId: string;
  organizationId: string | null;
  name: string | null;
  createdAt: string;
}

export function mapEventTypeResponse(raw: unknown): EventTypeResponse {
  return {
    eventTypeId: stringFieldOrNull(raw, 'eventTypeId')!,
    organizationId: stringFieldOrNull(raw, 'organizationId'),
    name: stringFieldOrNull(raw, 'name'),
    createdAt: stringField(raw, 'createdAt'),
  };
}

export interface EventIngestionResult {
  eventId: string;
  outcome: string | null;
  rejectionReason: string | null;
  fromStateId: string | null;
  toStateId: string | null;
  ruleId: string | null;
}

export function mapEventIngestionResult(raw: unknown): EventIngestionResult {
  return {
    eventId: stringFieldOrNull(raw, 'eventId')!,
    outcome: stringFieldOrNull(raw, 'outcome'),
    rejectionReason: stringFieldOrNull(raw, 'rejectionReason'),
    fromStateId: stringFieldOrNull(raw, 'fromStateId'),
    toStateId: stringFieldOrNull(raw, 'toStateId'),
    ruleId: stringFieldOrNull(raw, 'ruleId'),
  };
}

export interface CreateWorkflowResult { workflowId: string }
export function mapCreateWorkflowResult(raw: unknown): CreateWorkflowResult {
  return { workflowId: stringFieldOrNull(raw, 'workflowId')! };
}

export interface CreateWorkflowVersionResult { workflowVersionId: string }
export function mapCreateWorkflowVersionResult(raw: unknown): CreateWorkflowVersionResult {
  return { workflowVersionId: stringFieldOrNull(raw, 'workflowVersionId')! };
}

export interface CreateRuleResult { ruleId: string }
export function mapCreateRuleResult(raw: unknown): CreateRuleResult {
  return { ruleId: stringFieldOrNull(raw, 'ruleId')! };
}

export interface CreateEventTypeResult { eventTypeId: string }
export function mapCreateEventTypeResult(raw: unknown): CreateEventTypeResult {
  return { eventTypeId: stringFieldOrNull(raw, 'eventTypeId')! };
}
