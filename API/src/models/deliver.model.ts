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
  title: string; 
  @property({
    type: 'string',
  })
  company?: string;

  @property({
    type: 'string',
  })
  location?: string; 

  @property({
    type: 'string',
  })
  experience?: string; 

  @property({
    type: 'string',
  })
  salary?: string; 

  @property({
    type: 'string',
  })
  jobDescription?: string; 

  @property({
    type: 'string',
  })
  skills?: string;


  constructor(data?: Partial<Deliver>) {
    super(data);
  }
}

export interface DeliverRelations {
  // describe navigational properties here
}

export type DeliverWithRelations = Deliver & DeliverRelations;
