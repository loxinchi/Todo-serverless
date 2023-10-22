import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import {
  createAttachmentPresignedUrl,
  updateTodoImagePresignedURL
} from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const logger = createLogger('updatePresignedURLToDB')

    try {
      const url = createAttachmentPresignedUrl({ todoId })
      logger.info('pre-signed url generated successfully', { url })

      await updateTodoImagePresignedURL({ todoId, userId, url })
      logger.info('pre-signed url successfully updated in DB')

      return {
        statusCode: 201,
        body: JSON.stringify({
          uploadUrl: url
        })
      }
    } catch (error) {
      logger.error('failed to updated pre-signed url', {
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
