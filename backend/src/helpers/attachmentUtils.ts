import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const bucket = process.env.ATTACHMENT_S3_BUCKET

export const AttachmentUtils = {
  deleteAttachment: async ({ todoId }: { todoId: TodoItem['todoId'] }) => {
    const logger = createLogger('DeleteAttachment')

    const input = {
      Bucket: bucket,
      Key: `${todoId}.jpg`
    }

    try {
      await s3.headObject(input).promise()
    } catch (error) {
      logger.error('No attachment', { error })
    }

    return await s3.deleteObject(input).promise()
  },
  getPresignedURL: ({ todoId }: { todoId: TodoItem['todoId'] }) => {
    const expires = process.env.SIGNED_URL_EXPIRATION

    return s3.getSignedUrl('putObject', {
      Bucket: bucket,
      Key: `${todoId}.jpg`,
      Expires: parseInt(expires)
    })
  }
}
