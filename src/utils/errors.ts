// Classe d'erreur personnalisée pour l'application
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintient la stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Erreurs spécifiques pour différentes couches
export class ValidationError extends AppError {
  constructor(message: string, details?: string[]) {
    super(
      details ? `${message}: ${details.join(', ')}` : message,
      'VALIDATION_ERROR',
      400
    );
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'DATABASE_ERROR', 500);
    
    // Log l'erreur originale pour le debugging
    if (originalError) {
      console.error('Original database error:', originalError);
    }
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} with ID '${identifier}' not found`
      : `${resource} not found`;
    
    super(message, 'NOT_FOUND', 404);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`${service} error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 503);
  }
}

// Fonction helper pour déterminer si une erreur est opérationnelle
export function isOperationalError(error: unknown): boolean {
  return error instanceof AppError && error.isOperational;
}

// Logger d'erreurs centralisé
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextInfo = context ? `[${context}] ` : '';
  
  if (error instanceof AppError) {
    console.error(`${timestamp} ${contextInfo}AppError [${error.code}]: ${error.message}`);
    if (error.statusCode >= 500) {
      console.error(error.stack);
    }
  } else if (error instanceof Error) {
    console.error(`${timestamp} ${contextInfo}Error: ${error.message}`);
    console.error(error.stack);
  } else {
    console.error(`${timestamp} ${contextInfo}Unknown error:`, error);
  }
}

// Wrapper pour convertir les erreurs Supabase
export function handleDatabaseError(error: any, context: string): never {
  logError(error, `Database/${context}`);
  
  if (error?.code === 'PGRST116') {
    throw new NotFoundError(context);
  }
  
  if (error?.code === '23505') { // Unique constraint violation
    throw new ValidationError(`Duplicate entry in ${context}`);
  }
  
  if (error?.code === '23503') { // Foreign key violation
    throw new ValidationError(`Invalid reference in ${context}`);
  }
  
  throw new DatabaseError(`Database operation failed in ${context}`, error);
}

// Wrapper pour les erreurs de validation Zod
export function handleValidationError(error: any): never {
  if (error?.errors && Array.isArray(error.errors)) {
    const details = error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`);
    throw new ValidationError('Input validation failed', details);
  }
  
  throw new ValidationError(error.message || 'Validation failed');
}