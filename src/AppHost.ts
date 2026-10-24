/** Optional host presentation contract. Types only: old hosts need no runtime import. */
export type ChatAssistantLauncher = "auto" | "hidden_on_compact" | "hidden";

/** Manifest wire shape, shared by panels, contributions and native surfaces. */
export interface HostUI {
  chat_assistant?: { launcher?: ChatAssistantLauncher };
}

export interface HostUIRequest {
  chatAssistant: { launcher: ChatAssistantLauncher };
}

export interface AppHost {
  capabilities: { ui: { chatAssistantLauncher: boolean } };
  ui: {
    /** Request presentation for this mounted surface; release is idempotent. */
    request(settings: HostUIRequest): () => void;
  };
}

export function isHostUIRequest(value: unknown): value is HostUIRequest {
  if (!value || typeof value !== "object" || Object.keys(value).length !== 1) return false;
  const chat = (value as HostUIRequest).chatAssistant;
  return !!chat && typeof chat === "object" && Object.keys(chat).length === 1 &&
    (chat.launcher === "auto" || chat.launcher === "hidden_on_compact" || chat.launcher === "hidden");
}

export interface AppHostConnection extends AppHost {
  /** A new frame channel revokes old requests. React clients can rebind effects. */
  subscribe(listener: () => void): () => void;
  dispose(): void;
}

/** Iframe adapter for the same AppHost API injected into module panels.
 * Old hosts resolve with capabilities disabled after the bounded handshake.
 * The parent origin defaults to the same origin used by proxied app panels.
 */
export function connectAppHost(options: { parentOrigin?: string; timeoutMs?: number } = {}): Promise<AppHostConnection> {
  const origin = options.parentOrigin ?? window.location.origin;
  if (origin === "*" || new URL(origin).origin !== origin || origin === "null") throw new Error("An exact parent origin is required");
  return new Promise(resolve => {
    let channel = "";
    let disposed = false;
    let settled = false;
    const requests = new Map<string, string>();
    const listeners = new Set<() => void>();
    const post = (message: Record<string, unknown>) => window.parent.postMessage({protocol:"apteva.host",version:1,...message},origin);
    const host: AppHostConnection = {
      capabilities:{ui:{chatAssistantLauncher:false}},
      ui:{request(settings) {
        if (disposed || !channel || !host.capabilities.ui.chatAssistantLauncher || !isHostUIRequest(settings) || requests.size >= 32) return () => {};
        const requestId = crypto.randomUUID();
        requests.set(requestId,channel);
        post({type:"request",channel,requestId,settings});
        return () => { const ownedChannel = requests.get(requestId); if (ownedChannel) { requests.delete(requestId); post({type:"release",channel:ownedChannel,requestId}); } };
      }},
      subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
      dispose() {
        if (disposed) return;
        disposed = true;
        for (const [requestId,ownedChannel] of requests) post({type:"release",channel:ownedChannel,requestId});
        requests.clear();
        host.capabilities = {ui:{chatAssistantLauncher:false}};
        window.removeEventListener("message",receive);
        window.removeEventListener("pagehide",host.dispose);
        clearTimeout(timer);
        for (const listener of listeners) listener();
        listeners.clear();
        if (!settled) { settled = true; resolve(host); }
      },
    };
    const receive = (event: MessageEvent) => {
      const msg = event.data;
      if (event.source !== window.parent || event.origin !== origin || !msg || msg.protocol !== "apteva.host" || msg.version !== 1 || msg.type !== "init" || typeof msg.channel !== "string" || !msg.channel || msg.channel.length > 128 || typeof msg.capabilities?.ui?.chatAssistantLauncher !== "boolean") return;
      if (channel !== msg.channel) requests.clear();
      channel = msg.channel;
      host.capabilities = {ui:{chatAssistantLauncher:msg.capabilities.ui.chatAssistantLauncher}};
      clearTimeout(timer);
      if (!settled) { settled = true; resolve(host); }
      for (const listener of listeners) listener();
    };
    const timer = setTimeout(() => host.dispose(), Math.max(1,Math.min(options.timeoutMs ?? 1000,10000)));
    window.addEventListener("message",receive);
    window.addEventListener("pagehide",host.dispose);
    post({type:"ready"});
  });
}
