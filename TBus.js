'use strict';

const { O, A, F } = { O: {}, A: {}, F: {} }; // 基础类型扩展
F.isFunction = fn => fn instanceof Function;
O.set = (target, key, value) => {
  target[key] = value;
  return target; // 返回对象本身
};
A.remove = (ls, row) => {
  const idx = ls.indexOf(row);
  ls.splice(idx, idx !== -1 ? 1 : 0);
};

// 发布订阅
class Topic {
  constructor(name, fns = []) {
    this.name = name;
    this.fns = fns;
    this.once = [];
  }
  sub(fn, once) {
    if (!F.isFunction(fn)) return;
    once ? this.once.push(fn) : this.fns.push(fn);
  }
  unsub(fn, once) {
    if (!F.isFunction(fn)) return;
    once ? A.remove(this.once, fn) : A.remove(this.fns, fn);
  }
  pub(args) {
    let L0 = this.fns.length;
    let L1 = this.once.length;
    while (L0 > 0) this.fns[--L0](args);
    while (L1 > 0) this.once[--L1](args);
    this.once = []; // 清空once订阅
  }
}

// 事件
class TBus {
  static sk = Symbol(TBus.name);
  static regTopic = (pv, tk) => O.set(pv, tk, new Topic(tk));
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
    if (topic && topic.fns.length === 0 && topic.once.length === 0) delete this[TBus.sk][type]; // 销毁Topic
  }
  emit(type, args) {
    const topic = this[TBus.sk][type];
    if (topic) topic.pub(args); // 发布消息;
  }
}

// module.exports = TBus;
// export default TBus;
// export { Topic, EBus };
