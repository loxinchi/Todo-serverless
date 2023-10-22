import { AWSError } from 'aws-sdk'
import { DocumentClient, UpdateItemOutput } from 'aws-sdk/clients/dynamodb'
import { DeleteObjectOutput } from 'aws-sdk/clients/s3'
import { PromiseResult } from 'aws-sdk/lib/request'
import * as createError from 'http-errors'
import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import { AttachmentUtils } from './attachmentUtils'
import { TodosAccess } from './todosAccess'

const todosAccess = new TodosAccess()

export async function getTodosForUser({
  userId,
  sortBy
}: {
  userId: TodoItem['userId']
  sortBy: string
}): Promise<TodoItem[]> {
  const logger = createLogger('GetTodosForUser')
  if (!userId) {
    throw new createError.BadRequest('Invalid userId')
  }

  const todos = await todosAccess.getTodosForUser({ userId, sortBy })
  logger.info('todos list of user', { todos })

  return todos
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: TodoItem['userId']
): Promise<TodoItem> {
  if (!userId) {
    throw new createError.BadRequest('Invalid userId')
  }

  if (createTodoRequest.name === '') {
    throw new createError.BadRequest('Please give todo a name')
  }

  const todoId = uuid.v4()

  return await todosAccess.createTodo({
    todoId,
    userId,
    name: createTodoRequest.name,
    createdAt: new Date().toISOString(),
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: null
  })
}

export async function updateTodo({
  userId,
  todoId,
  updateTodoRequest
}: {
  userId: TodoItem['userId']
  todoId: TodoItem['todoId']
  updateTodoRequest: UpdateTodoRequest
}): Promise<PromiseResult<UpdateItemOutput, AWSError>> {
  if (!userId) {
    throw new createError.BadRequest('Invalid userId')
  }

  return await todosAccess.updateTodo({
    userId,
    todoId,
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  })
}

export async function deleteTodo({
  userId,
  todoId
}: {
  userId: TodoItem['userId']
  todoId: TodoItem['todoId']
}): Promise<PromiseResult<UpdateItemOutput, AWSError>> {
  if (!userId) {
    throw new createError.BadRequest('Invalid userId')
  }

  return await todosAccess.deleteTodo({
    userId,
    todoId
  })
}

export function createAttachmentPresignedUrl({
  todoId
}: {
  todoId: TodoItem['todoId']
}): string {
  const logger = createLogger('CreateAttachmentPresignedUrl')
  logger.info('Create attachment presigned Url, todoId: ', { todoId })

  return AttachmentUtils.getPresignedURL({ todoId })
}

export async function deleteAttachment({
  todoId
}: {
  todoId: TodoItem['todoId']
}): Promise<PromiseResult<DeleteObjectOutput, AWSError>> {
  const logger = createLogger('DeleteAttachment')
  logger.info('Deleted attachment todoId: ', { todoId })

  return await AttachmentUtils.deleteAttachment({ todoId })
}

export async function updateTodoImagePresignedURL({
  todoId,
  userId,
  url
}: {
  userId: TodoItem['userId']
  todoId: TodoItem['todoId']
  url: string
}): Promise<PromiseResult<DocumentClient.UpdateItemOutput, AWSError>> {
  if (!userId) {
    throw new createError.BadRequest('Invalid userId')
  }

  return await todosAccess.updateTodoImagePresignedURL({
    todoId,
    userId,
    url
  })
}
