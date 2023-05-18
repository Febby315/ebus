'use strict';

// 异步归一化
const normalizeAsync = (fn, delay = 0) => {
  return function () {
    if (!delay && setImmediate) return setImmediate(fn);
    setTimeout(() => fn.apply(this, arguments), delay);
  };
};

// 支持被继承、支持独立实例化、允许通过EBus.options设置默认处理器配置
class EBus {
  static __opKey = Symbol('ebus'); // 用于避免与被集成目标实例属性名冲突的唯一标识
  // 处理器归一化
  static normalizeHandler(handler, options) {
    if (!handler || handler.constructor !== Function) throw `${EBus.name}: 无效的事件处理器!`; // 无效处理器
    if (!handler[EBus.__opKey]) Object.defineProperty(handler, EBus.__opKey, { value: Object.assign({}, EBus.options), writable: true });
    Object.assign(handler[EBus.__opKey], options);
    return handler;
  }
  constructor() {
    this._events = new Map(); // 缓存各类事件监听器
    Object.defineProperty(this, EBus.__opKey, { value: Symbol('ebus') }); // TODO: 避免不同实例绑定相同处理器(通过EBus.__opKey值向实例挂载用于缓存handler的配置信息的键名)
  }
  on(type, handler, options) {
    if (!EBus.normalizeHandler(handler, options)) return;
    const handlers = this._events.get(type);
    Array.isArray(handlers) ? handlers.push(handler) : this._events.set(type, [handler]);
  }
  once(type, handler, options) {
    if (!EBus.normalizeHandler(handler, Object.assign(options, { once: true }))) return;
    const handlers = this._events.get(type);
    Array.isArray(handlers) ? handlers.push(handler) : this._events.set(type, [handler]);
  }
  off(type, handler) {
    const handlers = this._events.get(type) || [];
    const idx = handlers.indexOf(handler);
    if (idx === -1) return console.warn(`${EBus.name}: 未找到需要移除的监听器!`);
    const items = handlers.splice(idx, 1);
    items.map(item => delete item[EBus.__opKey]); // 处理器去归一化
  }
  emit(type, ...args) {
    const handlers = Object.assign([], this._events.get(type));
    while (handlers.length) {
      const handler = handlers.shift(); // 弹出式迭代
      const op = handler[EBus.__opKey];
      const listener = op.async ? normalizeAsync(handler, op.delay) : handler; // 异步支持
      listener.apply(op.context, args); // 上下文&多参支持
      if (op.once) this.off(type, handler); // once支持
    }
    if (type !== '*') this.emit('*', ...args); // 通配符支持
  }
}

export default EBus;
export { EBus, normalizeAsync };
