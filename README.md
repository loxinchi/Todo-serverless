# Serverless TODO

# Functionality of the application

This application will allow creating/removing/updating/fetching TODO items. Each TODO item can optionally have an attachment image. Each user only has access to TODO items that the user has created.

# TODO items

The application should store TODO items, and each TODO item contains the following fields:

* `todoId` (string) - a unique id for an item
* `createdAt` (string) - date and time when an item was created
* `name` (string) - name of a TODO item (e.g. "Change a light bulb")
* `dueDate` (string) - date and time by which an item should be completed
* `done` (boolean) - true if an item was completed, false otherwise
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a TODO item


# Features

Serverless framework

Auth0 authentication

S3 pre-signed url

lambda

DynamoDB:

- Sort TODO items by `createAt` or `dueDate` with local index(es)

- use `query()` for more efficient search

Distributed Tracing(AWS X-ray)

middy middleware

schema validation

Principle of Least Privilege (POLP)

[Winston](https://github.com/winstonjs/winston) logging
