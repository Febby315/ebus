'use strict';

// 异步归一化
const normalizeAsync = (fn, delay = 0) => {
  return function () {
    const callback = () => fn.apply(this, arguments);
    if (!delay && setImmediate) return setImmediate(callback);
    setTimeout(callback, delay);
  };
};

// 支持被继承、支持独立实例化、允许通过EBus.options全局设置处理器默认配置
class EBus {
  static __opKey = Symbol('ebus');
  // 处理器归一化
  static normalizeHandler(handler, opKey, options) {
    if (!handler || handler.constructor !== Function) throw `${EBus.name}: 无效的事件处理器!`; // 无效处理器
    if (!handler[opKey]) Object.defineProperty(handler, opKey, { value: Object.assign({}, EBus.options), configurable: true });
    Object.assign(handler[opKey], options);
    return handler;
  }
  constructor(options) {
    Object.defineProperties(this, {
      __events: { value: new Map() }, // 缓存各类事件监听器
      __ebus_opKey: { value: Symbol('ebus_opKey') }, // 防止不同实例绑定相同处理器时使用相同options
      [EBus.__opKey]: { value: Object.assign({}, EBus.options, options) } // 实例配置
    });
  }
  once(type, handler, options) {
    this.on(type, handler, Object.assign(options, { once: true }));
  }
  on(type, handler, options) {
    const op = Object.assign({}, this[EBus.__opKey], options);
    if (!EBus.normalizeHandler(handler, this.__ebus_opKey, op)) return;
    const handlers = this.__events.get(type);
    Array.isArray(handlers) ? handlers.push(handler) : this.__events.set(type, [handler]);
  }
  off(type, handler) {
    const handlers = this.__events.get(type) || [];
    const idx = handlers.indexOf(handler);
    if (idx === -1) return console.warn(`${EBus.name}: 未找到需要移除的监听器!`);
    delete handler[this.__ebus_opKey]; // 去处理器归一化
    handlers.splice(idx, 1); // 移除处理器
  }
  emit(type, ...args) {
    const handlers = Array.from(this.__events.get(type) || []);
    while (handlers.length) {
      const handler = handlers.shift(); // 弹出式迭代
      const op = handler[this.__ebus_opKey];
      const listener = op.sync ? handler : normalizeAsync(handler, op.delay); // 异步支持(默认同步)
      listener.apply(op.context, args); // 上下文&多参支持
      if (op.once) this.off(type, handler); // once支持
    }
    if (type !== '*') this.emit('*', ...args); // 通配符支持
  }
}

// module.exports = EBus;
export default EBus;
export { EBus, normalizeAsync };
