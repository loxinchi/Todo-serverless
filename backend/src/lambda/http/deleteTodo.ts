import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteAttachment, deleteTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const logger = createLogger('DeleteTodo')

    const todoId = event.pathParameters?.todoId

    if (!todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'todoId is missing in path parameters'
        })
      }
    }

    try {
      const userId = getUserId(event)
      await deleteTodo({ userId, todoId })
      await deleteAttachment({ todoId })
      logger.info('todo item deleted successfully')

      return {
        statusCode: 200,
        body: null
      }
    } catch (error) {
      logger.error('failed to delete todo', {
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
