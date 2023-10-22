import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getTodosForUser } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const logger = createLogger('GetTodos')
    logger.info('Processing event: ', event)
    logger.info('queryStringParameters: ', event.queryStringParameters)

    const { sortBy } = event.queryStringParameters

    try {
      const userId = getUserId(event)
      const items = await getTodosForUser({ userId, sortBy })
      logger.info('successfully fetched todos for user')

      return {
        statusCode: 200,
        body: JSON.stringify({
          items
        })
      }
    } catch (error) {
      logger.error('failed to get todo', {
        error
      })
      throw error
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
