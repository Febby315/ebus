"use strict";

Function.isFunction = (fn) => fn instanceof Function;
Object.set = (target, key, value) => {
  target[key] = value;
  return target; // 返回对象本身
};
Array.remove = (ls, row) => {
  const idx = ls.indexOf(row);
  if (idx !== -1) ls.splice(idx, 1);
};

// 发布订阅
class Topic {
  constructor(name, listeners = []) {
    this.name = name;
    this.listeners = listeners;
    this.once = [];
  }
  sub(fn, once) {
    if (!Function.isFunction(fn)) return;
    once ? this.once.push(fn) : this.listeners.push(fn);
  }
  unsub(fn, once) {
    if (!Function.isFunction(fn)) return;
    once ? Array.remove(this.once, fn) : Array.remove(this.listeners, fn);
  }
  pub(args) {
    let L0 = this.listeners.length;
    let L1 = this.once.length;
    while (L0 > 0) this.listeners[--L0](args);
    while (L1 > 0) this.once[--L1](args);
    this.once = []; // 清空once订阅
  }
}

// 事件
class TBus {
  static sk = Symbol(TBus.name);
  static regTopic = (pv, tk) => Object.set(pv, tk, new Topic(tk));
  constructor(events = []) {
    this[TBus.sk] = events.reduce(TBus.regTopic, {});
  }
  once(type, fn) {
    this.on(type, fn, true);
  }
  on(type, fn, once) {
    const topic = this[TBus.sk][type] || new Topic(type);
    topic.sub(fn, once); // 订阅
    if (!this[TBus.sk][type]) this[TBus.sk][type] = topic; // 不存在时绑定
  }
  off(type, fn, once) {
    const topic = this[TBus.sk][type];
    if (topic) topic.unsub(fn, once); // 退订
  }
  emit(type, args) {
    const topic = this[TBus.sk][type];
    if (topic) topic.pub(args); // 发布消息;
  }
}

// module.exports = TBus;
// export default TBus;
// export { Topic, EBus };
