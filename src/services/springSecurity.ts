import { User, UserRole, SpringAuthority, SpringSecurityError } from '../types';

/**
 * Spring Security JWT and Access Control Engine
 * Simulates standard Spring Security 6.x / Spring Boot 3.x SecurityFilterChain:
 * - SecurityFilterChain
 * - JwtAuthenticationFilter
 * - SecurityContextHolder
 * - AccessDeniedHandler & AuthenticationEntryPoint
 */

export interface JwtClaims {
  sub: string;
  email: string;
  name: string;
  roles: SpringAuthority[];
  authorities: SpringAuthority[];
  iss: string;
  iat: number;
  exp: number;
}

// Generate base64url encoded string
function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0: break;
    case 2: output += '=='; break;
    case 3: output += '='; break;
    default: throw new Error('Illegal base64url string!');
  }
  return decodeURIComponent(escape(atob(output)));
}

/**
 * Generates a signed Spring Security JWT token
 */
export function generateSpringSecurityJwt(user: User): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const authority: SpringAuthority = user.role === 'admin' ? 'ROLE_ADMIN' : 'ROLE_USER';

  const now = Math.floor(Date.now() / 1000);
  const payload: JwtClaims = {
    sub: user.email,
    email: user.email,
    name: user.name,
    roles: [authority],
    authorities: [authority],
    iss: 'org.springframework.security.apexstore',
    iat: now,
    exp: now + 86400 // 24 hours
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  // Standard HMAC mock signature for demo tokens
  const signatureB64 = base64UrlEncode(`sig_spring_sec_${user.id}_${now}`);

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

/**
 * Parses and validates Spring Security JWT Token
 */
export function parseSpringSecurityJwt(token: string): JwtClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = base64UrlDecode(parts[1]);
    const claims = JSON.parse(payloadJson) as JwtClaims;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (claims.exp && claims.exp < now) {
      return null;
    }

    return claims;
  } catch (e) {
    console.error('Failed to parse Spring Security JWT', e);
    return null;
  }
}

/**
 * Spring Security Authorization Enforcement
 * Replicates: .requestMatchers("/admin/**").hasRole("ADMIN")
 */
export function checkSpringSecurityAuthorization(
  token: string | null,
  requiredRole: 'ADMIN' | 'USER',
  requestedPath: string
): { authorized: boolean; error?: SpringSecurityError; claims?: JwtClaims } {
  const requiredAuthority = `ROLE_${requiredRole}`;

  if (!token) {
    return {
      authorized: false,
      error: {
        timestamp: new Date().toISOString(),
        status: 401,
        error: 'Unauthorized',
        message: 'Full authentication is required to access this resource. No Bearer token provided in Authorization header.',
        path: requestedPath,
        requiredAuthority,
        grantedAuthorities: []
      }
    };
  }

  const claims = parseSpringSecurityJwt(token);
  if (!claims) {
    return {
      authorized: false,
      error: {
        timestamp: new Date().toISOString(),
        status: 401,
        error: 'Unauthorized',
        message: 'Invalid or expired JWT token. SecurityContextHolder authentication failed.',
        path: requestedPath,
        requiredAuthority,
        grantedAuthorities: []
      }
    };
  }

  const hasRequiredAuthority = claims.authorities.includes(requiredAuthority as SpringAuthority);

  if (!hasRequiredAuthority) {
    return {
      authorized: false,
      claims,
      error: {
        timestamp: new Date().toISOString(),
        status: 403,
        error: 'Forbidden',
        message: `Access Denied: Principal [${claims.email}] does not possess granted authority [${requiredAuthority}]. Current authorities: [${claims.authorities.join(', ')}].`,
        path: requestedPath,
        requiredAuthority,
        grantedAuthorities: claims.authorities
      }
    };
  }

  return { authorized: true, claims };
}

/**
 * Visual Representation of the Spring Security Filter Chain
 */
export const SPRING_SECURITY_SPEC = {
  framework: 'Spring Security 6.2 / Spring Boot 3.2',
  securityFilterChain: [
    { order: 1, name: 'CorsFilter', purpose: 'Pre-flight and cross-origin handling' },
    { order: 2, name: 'CsrfFilter', purpose: 'Disabled for stateless JWT REST endpoints' },
    { order: 3, name: 'JwtAuthenticationFilter', purpose: 'Extracts Bearer token from Authorization header and populates SecurityContextHolder' },
    { order: 4, name: 'UsernamePasswordAuthenticationFilter', purpose: 'Authenticates user credentials at /api/auth/login' },
    { order: 5, name: 'ExceptionTranslationFilter', purpose: 'Catches AccessDeniedException and throws HTTP 403 Forbidden' },
    { order: 6, name: 'AuthorizationFilter', purpose: 'Evaluates RequestMatcherDelegatingAuthorizationManager rules' }
  ],
  authorizationRules: [
    { pattern: '/api/admin/**', authority: 'hasRole("ADMIN")', description: 'Strictly restricted to users with ROLE_ADMIN' },
    { pattern: '/api/orders/**', authority: 'hasAnyRole("USER", "ADMIN")', description: 'Customer or Admin order processing' },
    { pattern: '/api/products/**', authority: 'permitAll()', description: 'Public catalog access' },
    { pattern: '/api/auth/**', authority: 'permitAll()', description: 'Authentication and token issuance endpoints' }
  ]
};
