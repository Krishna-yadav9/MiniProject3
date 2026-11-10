import React, { useState } from 'react';
import { ShieldAlert, ArrowLeft, Key, Lock, ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Forbidden403ScreenProps {
  onReturnToStore: () => void;
  attemptedSection?: string;
}

export const Forbidden403Screen: React.FC<Forbidden403ScreenProps> = ({
  onReturnToStore,
  attemptedSection = '/api/admin/**'
}) => {
  const { currentUser, setIsAdminLoginOpen, jwtToken } = useAuth();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const securityPayload = {
    timestamp: new Date().toISOString(),
    status: 403,
    error: 'Forbidden',
    exception: 'org.springframework.security.access.AccessDeniedException',
    message: `Access Denied: Principal [${currentUser.email}] does not possess granted authority [ROLE_ADMIN]. Administrative privileges require authenticating with credentials stored in the Admin Database.`,
    path: attemptedSection.startsWith('/') ? attemptedSection : `/api/admin/${attemptedSection.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    requiredAuthority: 'ROLE_ADMIN',
    grantedAuthorities: [currentUser.authority || 'ROLE_USER'],
    filterChainRule: '.requestMatchers("/api/admin/**").hasRole("ADMIN")'
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Spring Security Red/Slate Header */}
        <div className="bg-stone-900 text-white p-5 border-b border-stone-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/40">
                    HTTP 403 FORBIDDEN
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">Spring Security 6.2</span>
                </div>
                <h2 className="text-base font-bold text-stone-100 mt-1">
                  Access Denied Exception
                </h2>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-stone-400 bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700/60">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>ROLE_ADMIN Required</span>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Spring Security intercepted this request through the <code className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono text-stone-800 dark:text-stone-200 text-[11px]">AuthorizationFilter</code>. The dashboard configuration, inventory modification, and sales analytics require valid administrator credentials verified against the Admin Database.
            </p>
          </div>

          {/* Current Principal Security Context */}
          <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 rounded-xl p-4 text-xs space-y-2.5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              Current SecurityContextHolder Principal
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-stone-200/60 dark:border-stone-700/60">
              <div>
                <span className="text-stone-400">User:</span>{' '}
                <strong className="text-stone-900 dark:text-stone-100">{currentUser.name}</strong>{' '}
                <span className="text-stone-400 font-mono">({currentUser.email})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-stone-400">Granted Authority:</span>
                <span className="px-2 py-0.5 font-mono text-[11px] font-bold bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded">
                  {currentUser.authority || 'ROLE_USER'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 pt-1">
              <span className="text-rose-500 font-semibold">Security Rule:</span>
              <span>
                <code className="font-mono text-[10px]">.requestMatchers(&quot;/api/admin/**&quot;).hasRole(&quot;ADMIN&quot;)</code> failed.
              </span>
            </div>
          </div>

          {/* Collapsible Spring Security JSON Payload & Filter Chain */}
          <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden text-xs">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800/80 dark:hover:bg-stone-800 transition text-left font-mono text-[11px] text-stone-600 dark:text-stone-300"
            >
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-stone-400" />
                <span>Spring Boot AccessDeniedHandler JSON Response</span>
              </span>
              {showTechnicalDetails ? (
                <ChevronDown className="w-4 h-4 text-stone-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-400" />
              )}
            </button>

            {showTechnicalDetails && (
              <div className="p-3 bg-stone-950 font-mono text-[11px] text-stone-300 space-y-3 overflow-x-auto">
                <pre className="text-emerald-400 leading-relaxed">
                  {JSON.stringify(securityPayload, null, 2)}
                </pre>
                <div className="pt-2 border-t border-stone-800 text-[10px] text-stone-400 space-y-1">
                  <div>SecurityFilterChain Order:</div>
                  <div className="text-stone-500 pl-2">1. JwtAuthenticationFilter: Bearer {jwtToken.slice(0, 24)}...</div>
                  <div className="text-stone-500 pl-2">2. SecurityContextHolder: setAuthentication(ROLE_USER)</div>
                  <div className="text-stone-300 font-semibold pl-2">3. AuthorizationFilter: RequestMatcherDelegatingAuthorizationManager -&gt; 403 Forbidden</div>
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => setIsAdminLoginOpen(true)}
              className="w-full flex items-center justify-between p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center shrink-0">
                  <Key className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">Admin Sign In Required</div>
                  <div className="text-[11px] text-indigo-200">Authenticate with username & password stored in Admin Database</div>
                </div>
              </div>
              <ArrowLeft className="w-4 h-4 text-indigo-200 rotate-180 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={onReturnToStore}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Storefront Catalog</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
