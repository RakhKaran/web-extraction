import { Entity, model, property, belongsTo} from '@loopback/repository';
import {Workflow} from './workflow.model';

@model()
export class WorkflowBlueprint extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'array',
    itemType: 'object',
    required: true
  })
  nodes: object[];

  @property({
    type: 'array',
    itemType: 'object',
    required: true
  })
  edges: object[];

  @property({
    type: 'array',
    itemType: 'object',
    required: true
  })
  bluePrint: object[];

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @property({
    type: 'date',
  })
  deletedAt?: Date;

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  isActive: boolean;

  @property({
    type: 'string',
  })
  remark?: string;

  @belongsTo(() => Workflow)
  workflowId: number;

  constructor(data?: Partial<WorkflowBlueprint>) {
    super(data);
  }
}

export interface WorkflowBlueprintRelations {
  // describe navigational properties here
}

export type WorkflowBlueprintWithRelations = WorkflowBlueprint & WorkflowBlueprintRelations;
