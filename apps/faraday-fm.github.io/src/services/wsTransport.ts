export const ws = new WebSocket("ws://localhost:8000/ws");

await new Promise<void>((res) => (ws.onopen = () => res()));
