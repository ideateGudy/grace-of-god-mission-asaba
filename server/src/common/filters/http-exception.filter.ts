import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request as Request & { id?: string }).id || 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string[] = ['Internal server error'];
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as Record<string, unknown> | string;

      if (typeof exceptionResponse === 'string') {
        message = [exceptionResponse];
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        if (Array.isArray(exceptionResponse.message)) {
          message = exceptionResponse.message.map((item) => String(item));
        } else if (typeof exceptionResponse.message === 'string') {
          message = [exceptionResponse.message];
        }
        if (typeof exceptionResponse.error === 'string') {
          error = exceptionResponse.error;
        }
      }
      if (status === HttpStatus.TOO_MANY_REQUESTS) {
        error = 'Too Many Requests';
        message = ['Too many requests. Please wait a moment before trying again.'];
      }
    } else if (typeof exception === 'object' && exception !== null && 'code' in exception) {
      // Prisma known request error mapping
      const prismaError = exception as { code: string; meta?: Record<string, unknown> };
      switch (prismaError.code) {
        case 'P2002': {
          status = HttpStatus.CONFLICT;
          error = 'Conflict';
          const target = Array.isArray(prismaError.meta?.target)
            ? (prismaError.meta?.target as string[]).join(', ')
            : 'identifier';
          message = [`A record with this ${target} already exists.`];
          break;
        }
        case 'P2025': {
          status = HttpStatus.NOT_FOUND;
          error = 'Not Found';
          message = ['The requested record does not exist or has been removed.'];
          break;
        }
        case 'P2003': {
          status = HttpStatus.BAD_REQUEST;
          error = 'Bad Request';
          message = ['Foreign key constraint failure on related resource.'];
          break;
        }
        case 'P1001':
        case 'P1002':
        case 'P2024': {
          status = HttpStatus.SERVICE_UNAVAILABLE;
          error = 'Service Unavailable';
          message = ['Database connection is temporarily unavailable. Please retry.'];
          break;
        }
        default: {
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          error = 'Internal Server Error';
          message = ['A database error occurred.'];
          break;
        }
      }
    }

    // Log 5xx errors with stack traces for production debugging
    if (status >= 500) {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.url} - Status ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      // In production, avoid leaking raw internal error details to client, except on health diagnostic route
      if (process.env.NODE_ENV === 'production' && !request.url.includes('/health')) {
        message = ['An unexpected error occurred. Please try again later.'];
      } else if (exception instanceof Error) {
        message = [exception.message];
      }
    } else {
      this.logger.warn(
        `[${requestId}] ${request.method} ${request.url} - Status ${status} - ${message.join(', ')}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      requestId,
    });
  }
}
