import {Entity, model, property} from '@loopback/repository';

@model()
export class Deliver extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

   @property({
    type: 'string',
 
  })
  modelName: string; 
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
 


  constructor(data?: Partial<Deliver>) {
    super(data);
  }
}

export interface DeliverRelations {
  // describe navigational properties here
}

export type DeliverWithRelations = Deliver & DeliverRelations;
