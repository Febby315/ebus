export class EBus {
  static __opKey = Symbol('ebus');
  static normalizeHandler(handler, options) {
    if (!handler || handler.constructor !== Function) return;
    if (!handler[EBus.__opKey]) Object.defineProperty(handler, EBus.__opKey, { value: {}, writable: true });
    Object.assign(handler[EBus.__opKey], options);
    return handler;
  }
  constructor() {
    this._events = new Map();
  }
  on(type, handler) {
    if (!EBus.normalizeHandler(handler)) return; // 无效处理器
    const handlers = this._events.get(type);
    Array.isArray(handlers) ? handlers.push(handler) : this._events.set(type, [handler]);
  }
  once(type, handler) {
    if (!EBus.normalizeHandler(handler, { once: true })) return; // 无效处理器
    const handlers = this._events.get(type);
    Array.isArray(handlers) ? handlers.push(handler) : this._events.set(type, [handler]);
  }
  off(type, handler) {
    const handlers = this._events.get(type) || [];
    const idx = handlers.indexOf(handler);
    if (idx !== -1) handlers.splice(idx, 1);
  }
  emit(type, ...args) {
    const handlers = Object.assign([], this._events.get(type));
    while (handlers.length) {
      const handler = handlers.shift();
      const op = handler[EBus.__opKey];
      handler.apply(op.context, args);
      if (op.once) this.off(type, handler); // 关闭一次性事件
    }
    if (type !== '*') this.emit('*', ...args); // 触发*监听器
  }
}
