import {inject} from '@loopback/core';
import {
  get,
  param,
  post,
  requestBody,
} from '@loopback/rest';
import {repository} from '@loopback/repository';
import {DeliverRepository} from '../repositories';

export class DeliverController {
  constructor(
    @repository(DeliverRepository)
    public deliverRepo: DeliverRepository,
  ) {}

  @get('/deliver/model/{Deliver}')
  async getModelSchema(
    @param.path.string('Deliver') Deliver: string,
  ): Promise<object> {
  
    const models: {[key: string]: string[]} = {
      Deliver: [
        'title',
        'company',
        'location',
        'experience',
        'salary',
        'jobDescription',
        'skills',
      ],
    };

    const fields = models[Deliver];
    if (!fields) {
      return {error: 'Model not found'};
    }
    return {Deliver, fields};
  }

  // 2️⃣ Get API Methods
  @get('/deliver/api/{apiEndpoint}/methods')
  async getApiMethods(
    @param.path.string('apiEndpoint') apiEndpoint: string,
  ): Promise<string[]> {
    // You can customize methods per endpoint if needed
    return ['POST', 'GET', 'PATCH', 'PUT'];
  }

  // 3️⃣ Submit Mapped Data
  @post('/deliver/submit')
  async submitMapping(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              mode: {type: 'string'},
              target: {type: 'string'},
              method: {type: 'string'},
              fields: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    fieldName: {type: 'string'},
                    selectorType: {type: 'string'},
                    mappedFrom: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    })
    body: any,
  ): Promise<object> {
    // Here you can save mapping in DB or call API
    console.log('Mapping Submitted:', body);

    return {success: true, data: body};
  }
}
