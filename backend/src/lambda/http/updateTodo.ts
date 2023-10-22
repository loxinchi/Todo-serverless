import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const logger = createLogger('DeleteTodo')

    const todoId = event.pathParameters?.todoId

    if (!todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'todoId is missing in path parameters' })
      }
    }

    try {
      const userId = getUserId(event)
      const updateTodoRequest = JSON.parse(event.body)
      await updateTodo({ userId, todoId, updateTodoRequest })
      logger.info('todo item updated successfully')

      return {
        statusCode: 201,
        body: null
      }
    } catch (error) {
      logger.error('failed to update todo', {
        error
      })
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({ error: error.messages })
      }
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
