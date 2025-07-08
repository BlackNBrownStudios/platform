/**
 * TypeScript declaration file for module aliases
 * This helps TypeScript understand our module aliases
 */
declare module '@shared/types' {
  export * from '../../shared/src/types';
}

declare module '@shared/services/api.mobile' {
  export * from '../../shared/src/services/api.mobile';
}

declare module '@shared/services/*' {
  export * from '../../shared/src/services/*';
}

declare module '@app/*' {
  export * from '../app/*';
}
