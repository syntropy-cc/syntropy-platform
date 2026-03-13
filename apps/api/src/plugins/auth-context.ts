/**
 * Auth context plugin — provides SupabaseAuthAdapter for routes (COMP-002.6).
 *
 * Creates Supabase client from env and wraps it as SupabaseAuthLike for
 * @syntropy/identity SupabaseAuthAdapter. When SUPABASE_URL or SUPABASE_ANON_KEY
 * are missing, adapter is undefined and auth routes return 503.
 * Options.auth and options.supabaseClient override for testing.
 */

import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  SupabaseAuthAdapter,
  type SupabaseAuthLike,
  type AuthProvider,
} from "@syntropy/identity";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";

export interface AuthContextOptions {
  auth?: AuthProvider | null;
  supabaseClient?: SupabaseClient | null;
}

function createSupabaseAuthLike(client: SupabaseClient): SupabaseAuthLike {
  return {
    async getUser(jwt: string) {
      const {
        data: { user },
        error,
      } = await client.auth.getUser(jwt);
      return {
        data: { user: user ? { id: user.id, email: user.email, user_metadata: user.user_metadata, app_metadata: user.app_metadata } : null },
        error: error ? { message: error.message } : null,
      };
    },
    async signInWithPassword(params: { email: string; password: string }) {
      const {
        data: { session },
        error,
      } = await client.auth.signInWithPassword(params);
      return {
        data: {
          session: session
            ? {
                access_token: session.access_token,
                refresh_token: session.refresh_token ?? undefined,
                expires_at: session.expires_at,
                user: {
                  id: session.user.id,
                  email: session.user.email,
                  user_metadata: session.user.user_metadata,
                  app_metadata: session.user.app_metadata,
                },
              }
            : null,
        },
        error: error ? { message: error.message } : null,
      };
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      return { error: error ? { message: error.message } : null };
    },
  };
}

async function authContextPlugin(
  fastify: FastifyInstance,
  opts: AuthContextOptions | Record<string, unknown>
): Promise<void> {
  const options = opts as AuthContextOptions;
  let adapter: AuthProvider | null = options.auth ?? null;
  let supabaseClient: SupabaseClient | null = options.supabaseClient ?? null;
  if (adapter === null && supabaseClient === null && SUPABASE_URL && SUPABASE_ANON_KEY) {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    supabaseClient = client;
    const authLike = createSupabaseAuthLike(client);
    adapter = new SupabaseAuthAdapter(authLike);
  }
  fastify.decorate("auth", adapter);
  fastify.decorate("supabaseClient", supabaseClient);
}

declare module "fastify" {
  interface FastifyInstance {
    auth: AuthProvider | null;
    supabaseClient: SupabaseClient | null;
  }
}

export const authContextPluginFp = fp(authContextPlugin, {
  name: "auth-context",
});
