import { Entity, model, property, belongsTo} from '@loopback/repository';
import {WorkflowBlueprint} from './workflow-blueprint.model';

@model()
export class Workflow extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  description?: string;

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

  @belongsTo(() => WorkflowBlueprint)
  workflowBlueprintId: number;

  constructor(data?: Partial<Workflow>) {
    super(data);
  }
}

export interface WorkflowRelations {
  // describe navigational properties here
}

export type WorkflowWithRelations = Workflow & WorkflowRelations;
