import 'source-map-support/register'

import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import axios from 'axios'
import { verify } from 'jsonwebtoken'

import { JwtPayload } from '../../auth/JwtPayload'
import { createLogger } from '../../utils/logger'
import { certToPEM } from '../utils'

const logger = createLogger('Authorizer')

const jwksUrl =
  'https://dev-vt5dbxtmqzdmtodk.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info(
    'Authorizing a user, event:',
    event,
    'Authorizing a user, event.authorizationToken:',
    event.authorizationToken
  )
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('user was authorized')

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('user was not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const cert = await getCert()
  console.log(
    'verify',
    verify(
      token, // Token from an HTTP header to validate
      cert, // A certificate copied from Auth0 website
      { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
    ) as JwtPayload
  )

  return verify(
    token, // Token from an HTTP header to validate
    cert, // A certificate copied from Auth0 website
    { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
  ) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')
  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getCert(): Promise<string> {
  try {
    const response = await axios.get(jwksUrl)
    const certString = response.data.keys[0].x5c[0]
    logger.info('Certificate is downloaded successfully')

    return certToPEM(certString)
  } catch (error) {
    logger.error('User not authorized', { error })
  }
}
