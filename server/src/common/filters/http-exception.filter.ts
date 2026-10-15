import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string[] = ['Internal server error'];
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      
      if (typeof exceptionResponse === 'string') {
        message = [exceptionResponse];
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        if (Array.isArray(exceptionResponse.message)) {
          message = exceptionResponse.message;
        } else if (typeof exceptionResponse.message === 'string') {
          message = [exceptionResponse.message];
        }
        error = exceptionResponse.error || error;
      }
    }

    const requestId = (request as Request & { id?: string }).id || 'unknown';
    if (status >= 500) {
      message = ['Internal server error'];
      error = 'Internal Server Error';
    }

    response
      .status(status)
      .json({
        statusCode: status,
        error,
        message,
        requestId,
      });
  }
}
