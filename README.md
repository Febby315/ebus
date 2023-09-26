# ebus
一个超级强大简洁轻量的前端事件库

## 支持
- [x] 支持独立实例化
- [x] 以继承方式扩展任何类
- [x] 支持处理器默认参数
- [x] 支持once一次性事件
- [x] 支持事件异步&延迟
- [x] 支持\*通配符事件
- [x] 支持多参数
- [x] API简洁: on、off、once、emit

### API
```ts
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
```

## 示例

 - 独立实例化

```javascript
const bus = new EBus()
bus.on('msg', (msg) => console.log(msg)) // 正常监听
bus.once('*', (e) => console.log('一次性监听!', e)) // 一次性监听
setTimeout(() => bus.emit('msg', 'Hello Word!'), 1000)
setTimeout(() => bus.emit('msg', '你好啊'), 2000)
```

 - 以继承方式扩展任何类

```javascript
class MyArray extends EBus {
  constructor() {
    super()
    this.list = []
  }
  push() {
    const result = Array.prototype.push.apply(this.list, arguments)
    this.emit('push', ...arguments) // 多参数
    return result
  }
}
const myList = new MyArray()
myList.on('push', (...args) => console.log(args), { sync: true }) // 同步+多参
setTimeout(() => myList.push('item1', 'item2'), 1000)
```


## 参考

  [mitt](https://github.com/developit/mitt): \*通配符及map的使用借鉴了其思想
