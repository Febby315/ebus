/**
 * @param {String} type 事件类型
 * @param {Function} handler 处理函数
 * @param {String} options.context 处理函数调用时this指向
 * @param {Boolean} options.sync ?同步调用处理函数
 * @param {Number} options.delay 异步调用时延迟(ms)
 */
interface EBus {
  on(type: string, handler: Function, options: any): void;
  once(type: string, handler: Function, options: any): void;
  off(type: string, handler: Function): void;
  emit(type: string, ...args: any[]): void;
}
