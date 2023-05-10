export class EBus {
  static __opKey = Symbol('ebus');
  static normolizeHandler(handler, options) {
    const op = Object.assign({ once: false, context: undefined }, EBus.options, options);
    return Object.defineProperties(handler, EBus.__opKey, { value: op, writable: true, configurable: true });
  }
  static applyHandler = (handler, args) => {
    const op = handler[EBus.__opKey];
    handler.apply(op.context, args);
    return op.once;
  };
  constructor() {
    this._events = new Map();
  }
  on(type, handler) {
    if (!handler || handler.constructor !== Function || handler instanceof Function) return;
    if (!Array.isArray(this._events.get(type))) this._events.set(type, []);
    const handlers = this._events.get(type);
    handlers.push(EBus.normolizeHandler(handler));
  }
  off(type, handler) {
    const handlers = this._events.get(type) || [];
    const idx = handlers.indexOf(handler);
    if (idx !== -1) handlers.splice(idx, 1);
  }
  once(type, handler) {
    this.on(type, handler);
    const op = handler[EBus.__opKey];
    if (op) op.once = true; // 标记once
  }
  emit(type, ...args) {
    const handlers = this._events.get(type) || [];
    const handlers_all = this._events.get('*') || [];
    const onceList = handlers.filter(handler => EBus.applyHandler(handler, args));
    const onceList_all = handlers_all.filter(handler => EBus.applyHandler(handler, args));
    // 移除once监听器
    onceList.map(handler => this.off(type, handler));
    onceList_all.map(handler => this.on(type, handler));
  }
}
