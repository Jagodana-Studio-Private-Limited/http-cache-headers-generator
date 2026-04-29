"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ToolEvents } from "@/lib/analytics";

// ─── Types ───────────────────────────────────────────────────────────────────

type ResourceType = "html" | "css-js" | "images" | "fonts" | "api" | "custom";
type Visibility = "public" | "private" | "no-cache" | "no-store";

interface CacheConfig {
  resourceType: ResourceType;
  visibility: Visibility;
  maxAge: number;
  useSmaxage: boolean;
  smaxage: number;
  staleWhileRevalidate: boolean;
  swr: number;
  staleIfError: boolean;
  sie: number;
  immutable: boolean;
  mustRevalidate: boolean;
}

// ─── Presets ─────────────────────────────────────────────────────────────────

const PRESETS: Record<ResourceType, Partial<CacheConfig>> = {
  html: {
    visibility: "public",
    maxAge: 0,
    useSmaxage: false,
    smaxage: 60,
    staleWhileRevalidate: true,
    swr: 60,
    staleIfError: true,
    sie: 86400,
    immutable: false,
    mustRevalidate: true,
  },
  "css-js": {
    visibility: "public",
    maxAge: 31536000,
    useSmaxage: false,
    smaxage: 31536000,
    staleWhileRevalidate: false,
    swr: 86400,
    staleIfError: false,
    sie: 86400,
    immutable: true,
    mustRevalidate: false,
  },
  images: {
    visibility: "public",
    maxAge: 2592000,
    useSmaxage: false,
    smaxage: 2592000,
    staleWhileRevalidate: true,
    swr: 86400,
    staleIfError: true,
    sie: 604800,
    immutable: false,
    mustRevalidate: false,
  },
  fonts: {
    visibility: "public",
    maxAge: 31536000,
    useSmaxage: false,
    smaxage: 31536000,
    staleWhileRevalidate: false,
    swr: 86400,
    staleIfError: false,
    sie: 86400,
    immutable: true,
    mustRevalidate: false,
  },
  api: {
    visibility: "private",
    maxAge: 0,
    useSmaxage: false,
    smaxage: 0,
    staleWhileRevalidate: false,
    swr: 0,
    staleIfError: false,
    sie: 0,
    immutable: false,
    mustRevalidate: true,
  },
  custom: {
    visibility: "public",
    maxAge: 3600,
    useSmaxage: false,
    smaxage: 3600,
    staleWhileRevalidate: false,
    swr: 60,
    staleIfError: false,
    sie: 86400,
    immutable: false,
    mustRevalidate: false,
  },
};

const RESOURCE_LABELS: Record<ResourceType, { label: string; emoji: string; hint: string }> = {
  html: { label: "HTML Pages", emoji: "🌐", hint: "HTML documents — usually stale-while-revalidate with short or zero max-age" },
  "css-js": { label: "CSS / JS", emoji: "⚡", hint: "Hashed static assets — long max-age with immutable" },
  images: { label: "Images", emoji: "🖼️", hint: "Image assets — moderate max-age, stale-while-revalidate" },
  fonts: { label: "Fonts", emoji: "🔤", hint: "Web fonts — long max-age with immutable" },
  api: { label: "API Responses", emoji: "🔌", hint: "REST/GraphQL responses — private, no-cache or short max-age" },
  custom: { label: "Custom", emoji: "⚙️", hint: "Configure every directive manually" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds === 0) return "0 seconds";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s) parts.push(`${s}s`);
  return parts.join(" ");
}

function buildHeader(cfg: CacheConfig): string {
  if (cfg.visibility === "no-store") return "no-store";

  const parts: string[] = [];

  if (cfg.visibility === "no-cache") {
    parts.push("no-cache");
  } else {
    parts.push(cfg.visibility); // public | private
    parts.push(`max-age=${cfg.maxAge}`);
  }

  if (cfg.useSmaxage && cfg.visibility === "public") {
    parts.push(`s-maxage=${cfg.smaxage}`);
  }
  if (cfg.staleWhileRevalidate) {
    parts.push(`stale-while-revalidate=${cfg.swr}`);
  }
  if (cfg.staleIfError) {
    parts.push(`stale-if-error=${cfg.sie}`);
  }
  if (cfg.immutable) parts.push("immutable");
  if (cfg.mustRevalidate) parts.push("must-revalidate");

  return parts.join(", ");
}

function buildExplanation(cfg: CacheConfig): string[] {
  const lines: string[] = [];

  if (cfg.visibility === "no-store") {
    lines.push("🚫 no-store — The response is never stored anywhere, in any cache.");
    return lines;
  }

  if (cfg.visibility === "no-cache") {
    lines.push("🔄 no-cache — Despite the name, the browser does cache the response. But it must revalidate with the server every time before using it (via If-None-Match / If-Modified-Since). If the server returns 304 Not Modified, the cached copy is used.");
  } else if (cfg.visibility === "public") {
    lines.push("🌍 public — Any cache (browser, CDN, proxy) may store this response.");
    if (cfg.maxAge > 0) {
      lines.push(`⏱️ max-age=${cfg.maxAge} (${formatDuration(cfg.maxAge)}) — Browsers and CDNs treat the response as fresh for this long. No network request is made during this window.`);
    } else {
      lines.push("⏱️ max-age=0 — The response expires immediately. Must revalidate on every request.");
    }
  } else if (cfg.visibility === "private") {
    lines.push("🔒 private — Only the end-user's browser may cache this. CDNs and shared proxies must not store it.");
    if (cfg.maxAge > 0) {
      lines.push(`⏱️ max-age=${cfg.maxAge} (${formatDuration(cfg.maxAge)}) — The browser keeps this response fresh for this long.`);
    } else {
      lines.push("⏱️ max-age=0 — The browser must revalidate on every request.");
    }
  }

  if (cfg.useSmaxage && cfg.visibility === "public") {
    lines.push(`🏗️ s-maxage=${cfg.smaxage} (${formatDuration(cfg.smaxage)}) — Overrides max-age for shared caches (CDNs, proxies) only. Browsers still respect max-age.`);
  }
  if (cfg.staleWhileRevalidate) {
    lines.push(`⚡ stale-while-revalidate=${cfg.swr} (${formatDuration(cfg.swr)}) — After max-age expires, the browser can serve the stale cached response immediately while fetching a fresh copy in the background. This eliminates latency for the user.`);
  }
  if (cfg.staleIfError) {
    lines.push(`🛡️ stale-if-error=${cfg.sie} (${formatDuration(cfg.sie)}) — If the origin server returns a 5xx error, the stale cached response can be used for up to this long. Protects users during outages.`);
  }
  if (cfg.immutable) {
    lines.push("🔒 immutable — Tells the browser this response will never change during its max-age window. The browser skips revalidation checks entirely. Only use with content-hashed filenames.");
  }
  if (cfg.mustRevalidate) {
    lines.push("⚠️ must-revalidate — Once the response is stale, the browser must revalidate with the server before serving it. It cannot use a stale copy even if the server is unreachable.");
  }

  return lines;
}

function buildNginxSnippet(header: string): string {
  return `location ~* \\.(js|css)$ {
  add_header Cache-Control "${header}";
}`;
}

function buildApacheSnippet(header: string): string {
  return `<FilesMatch "\\.(js|css|png|jpg|woff2)$">
  Header set Cache-Control "${header}"
</FilesMatch>`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NumberInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-32 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <span className="text-xs text-muted-foreground">
          {hint ?? formatDuration(value)}
        </span>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <button
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 relative flex-shrink-0 w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
          checked ? "bg-brand" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
        )}
      </div>
    </label>
  );
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    ToolEvents.resultCopied();
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleCopy}
      className="gap-1.5 shrink-0"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {label ?? "Copy"}
    </Button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DEFAULT_CONFIG: CacheConfig = {
  resourceType: "html",
  ...PRESETS.html,
} as CacheConfig;

export function HttpCacheHeadersGeneratorTool() {
  const [cfg, setCfg] = useState<CacheConfig>(DEFAULT_CONFIG);

  const update = useCallback(
    <K extends keyof CacheConfig>(key: K, value: CacheConfig[K]) => {
      setCfg((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const applyPreset = useCallback((type: ResourceType) => {
    setCfg((prev) => ({
      ...prev,
      resourceType: type,
      ...PRESETS[type],
    }));
    ToolEvents.toolUsed(`preset-${type}`);
  }, []);

  const reset = useCallback(() => {
    setCfg(DEFAULT_CONFIG);
    toast.success("Reset to HTML preset");
  }, []);

  const header = buildHeader(cfg);
  const explanation = buildExplanation(cfg);
  const showMaxAge = cfg.visibility !== "no-store" && cfg.visibility !== "no-cache";
  const showPublicOptions = cfg.visibility === "public";

  return (
    <div className="space-y-6">
      {/* Resource Type Selector */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">1. Select Resource Type</h2>
          <Button size="sm" variant="ghost" onClick={reset} className="gap-1.5 text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.keys(RESOURCE_LABELS) as ResourceType[]).map((type) => {
            const { label, emoji, hint } = RESOURCE_LABELS[type];
            const isActive = cfg.resourceType === type;
            return (
              <button
                key={type}
                onClick={() => applyPreset(type)}
                title={hint}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-3 border text-sm font-medium transition-all text-left ${
                  isActive
                    ? "bg-brand/10 border-brand text-brand"
                    : "border-border/50 hover:border-border hover:bg-muted/40"
                }`}
              >
                <span className="text-xl">{emoji}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {RESOURCE_LABELS[cfg.resourceType].hint}
        </p>
      </div>

      {/* Directives */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <h2 className="text-lg font-semibold mb-5">2. Configure Directives</h2>

        {/* Visibility */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground block mb-2">
            Cache Visibility
          </label>
          <div className="flex flex-wrap gap-2">
            {(["public", "private", "no-cache", "no-store"] as Visibility[]).map((v) => (
              <button
                key={v}
                onClick={() => update("visibility", v)}
                className={`rounded-lg px-3 py-1.5 text-sm font-mono font-medium border transition-all ${
                  cfg.visibility === v
                    ? "bg-brand text-white border-brand"
                    : "border-border/50 hover:border-border"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {cfg.visibility === "public" && "Any cache (browser, CDN, proxy) may store this response."}
            {cfg.visibility === "private" && "Only the user's browser may cache this. CDNs must not store it."}
            {cfg.visibility === "no-cache" && "Cache the response but revalidate with the server before every use."}
            {cfg.visibility === "no-store" && "Never store this response anywhere."}
          </p>
        </div>

        {showMaxAge && (
          <div className="mb-6 grid sm:grid-cols-2 gap-5">
            <NumberInput
              label="max-age (seconds)"
              value={cfg.maxAge}
              onChange={(v) => update("maxAge", v)}
            />
          </div>
        )}

        <div className="space-y-4">
          {showPublicOptions && (
            <Toggle
              label="s-maxage (CDN override)"
              checked={cfg.useSmaxage}
              onChange={(v) => update("useSmaxage", v)}
              description="Override max-age specifically for CDNs and shared proxies."
            />
          )}
          {cfg.useSmaxage && showPublicOptions && (
            <div className="pl-13 ml-13">
              <NumberInput
                label="s-maxage (seconds)"
                value={cfg.smaxage}
                onChange={(v) => update("smaxage", v)}
              />
            </div>
          )}

          <Toggle
            label="stale-while-revalidate"
            checked={cfg.staleWhileRevalidate}
            onChange={(v) => update("staleWhileRevalidate", v)}
            description="Serve stale content immediately while refreshing in the background."
          />
          {cfg.staleWhileRevalidate && (
            <div className="pl-13">
              <NumberInput
                label="Revalidate window (seconds)"
                value={cfg.swr}
                onChange={(v) => update("swr", v)}
              />
            </div>
          )}

          <Toggle
            label="stale-if-error"
            checked={cfg.staleIfError}
            onChange={(v) => update("staleIfError", v)}
            description="Serve stale content during origin server errors (5xx)."
          />
          {cfg.staleIfError && (
            <div className="pl-13">
              <NumberInput
                label="Error tolerance window (seconds)"
                value={cfg.sie}
                onChange={(v) => update("sie", v)}
              />
            </div>
          )}

          <Toggle
            label="immutable"
            checked={cfg.immutable}
            onChange={(v) => update("immutable", v)}
            description="Tells the browser this file will never change. Only use with content-hashed filenames."
          />

          <Toggle
            label="must-revalidate"
            checked={cfg.mustRevalidate}
            onChange={(v) => update("mustRevalidate", v)}
            description="Force revalidation once stale — even if the server is unreachable."
          />
        </div>
      </div>

      {/* Output */}
      <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-6">
        <h2 className="text-lg font-semibold">3. Your Cache-Control Header</h2>

        {/* Header string */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Header Value</span>
            <CopyButton text={header} />
          </div>
          <div className="rounded-xl bg-muted/60 border border-border/50 px-4 py-3 font-mono text-sm break-all text-foreground select-all">
            <span className="text-muted-foreground">Cache-Control: </span>
            <span className="text-brand font-semibold">{header}</span>
          </div>
        </div>

        {/* Full header line */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Full Header Line</span>
            <CopyButton text={`Cache-Control: ${header}`} label="Copy full" />
          </div>
          <div className="rounded-xl bg-muted/60 border border-border/50 px-4 py-3 font-mono text-sm break-all text-brand select-all">
            {`Cache-Control: ${header}`}
          </div>
        </div>

        {/* Explanation */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Plain-English Explanation
          </h3>
          <ul className="space-y-2.5">
            {explanation.map((line, i) => (
              <li key={i} className="text-sm leading-relaxed text-foreground/80">
                {line}
              </li>
            ))}
          </ul>
        </div>

        {/* Server snippets */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nginx</span>
              <CopyButton text={buildNginxSnippet(header)} label="Copy" />
            </div>
            <pre className="rounded-xl bg-muted/60 border border-border/50 px-4 py-3 font-mono text-xs text-foreground/80 overflow-x-auto whitespace-pre-wrap">
              {buildNginxSnippet(header)}
            </pre>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Apache</span>
              <CopyButton text={buildApacheSnippet(header)} label="Copy" />
            </div>
            <pre className="rounded-xl bg-muted/60 border border-border/50 px-4 py-3 font-mono text-xs text-foreground/80 overflow-x-auto whitespace-pre-wrap">
              {buildApacheSnippet(header)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
