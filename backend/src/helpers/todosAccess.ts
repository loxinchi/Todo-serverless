import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { PromiseResult } from 'aws-sdk/lib/request'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8005'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosCreateAtIndex = process.env.TODOS_CREATED_AT_INDEX,
    private readonly todosDueDateIndex = process.env.TODOS_DUE_DATE_INDEX
  ) {}

  async getTodosForUser({
    userId,
    sortBy
  }: {
    userId: TodoItem['userId']
    sortBy: string
  }): Promise<TodoItem[]> {
    logger.info('Getting all todos for a user')

    const isSortByDueDate = sortBy.includes('dueDate')
    logger.info('isSortByDueDate', { isSortByDueDate })
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: isSortByDueDate
          ? this.todosDueDateIndex
          : this.todosCreateAtIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const todos = result.Items
    return todos as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Creating a new todo')

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()

    return todo
  }

  async updateTodo({
    userId,
    todoId,
    name,
    dueDate,
    done
  }: {
    userId: TodoItem['userId']
    todoId: TodoItem['todoId']
    name: TodoUpdate['name']
    dueDate: TodoUpdate['dueDate']
    done: TodoUpdate['done']
  }): Promise<
    PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>
  > {
    logger.info('Updating a todo item')
    const params = {
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      ExpressionAttributeNames: {
        '#N': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ExpressionAttributeValues: {
        ':todoName': name,
        ':dueDate': dueDate,
        ':done': done
      },
      UpdateExpression: 'set #N= :todoName, #dueDate = :dueDate, #done = :done',
      ReturnValues: 'NONE'
    }

    return await this.docClient.update(params).promise()
  }

  async deleteTodo({
    userId,
    todoId
  }: {
    userId: TodoItem['userId']
    todoId: TodoItem['todoId']
  }): Promise<
    PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>
  > {
    logger.info('Deleting a todo item')

    const params = {
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      ReturnValues: 'NONE'
    }

    return await this.docClient.delete(params).promise()
  }

  async updateTodoImagePresignedURL({
    todoId,
    userId,
    url
  }: {
    userId: TodoItem['userId']
    todoId: TodoItem['todoId']
    url: string
  }): Promise<
    PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>
  > {
    logger.info('Updating attachment presigned url to DB')

    const params = {
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      ExpressionAttributeNames: {
        '#attachmentUrl': 'attachmentUrl'
      },
      ExpressionAttributeValues: {
        ':attachmentUrl': url.split('?')[0]
      },
      UpdateExpression: 'set #attachmentUrl= :attachmentUrl',
      ReturnValues: 'UPDATED_NEW'
    }

    return await this.docClient.update(params).promise()
  }
}
