'use strict';

const marge = Object.assign;
const define = Object.defineProperty;
// 异步归一化
const normalizeAsync = (fn, delay = 0) => {
  return function () {
    const callback = () => fn.apply(this, arguments);
    if (!delay && setImmediate) return setImmediate(callback);
    setTimeout(callback, delay);
  };
};

// 高性能、支持被继承、支持独立实例化
class EBus {
  static __ebusKey = Symbol('ebus');
  // 事件配置归一化
  static normalizeHandler(e, handler) {
    if (!handler || handler.constructor !== Function) throw `${EBus.name}: 无效的事件处理器!`;
    return marge(e, { handler })
  }
  constructor(options) {
    define(this, '__events', { value: new Map() }) // 缓存各类事件监听器
  }
  once(type, handler, options) {
    this.on(type, handler, marge(options || {}, { once: true }));
  }
  on(type, handler, options) {
    const e = marge({}, options);
    if (!EBus.normalizeHandler(e, handler)) return;
    const events = this.__events.get(type);
    Array.isArray(events) ? events.push(e) : this.__events.set(type, [e]);
  }
  off(type, handler) {
    const events = this.__events.get(type) || [];
    const idx = events.findIndex(v => v.handler === handler);
    return idx !== -1 ? events.splice(idx, 1) : null; // 移除处理器
  }
  emit(type, ...args) {
    const events = Array.from(this.__events.get(type) || []);
    while (events.length) {
      const e = events.shift(); // 弹出式迭代
      const listener = e.sync ? e.handler : normalizeAsync(e.handler, e.delay); // 异步支持(默认同步)
      listener.apply(e.context, args); // 上下文&多参支持
      if (e.once) this.off(type, e.handler); // once支持
    }
    if (type !== '*') this.emit('*', ...args); // 通配符支持
  }
}

// module.exports = EBus;
export default EBus;
export { EBus, normalizeAsync };
