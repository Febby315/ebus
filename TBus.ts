
interface Topic {
  name: string;
  listeners: any[];
  once: any[];
  sub(fn: Function, once: boolean): void;
  unsub(fn: Function, once: boolean): void;
  pub(args: any): void;
}

interface TBus {
  on(type: string, fn: Function, once?: boolean): void;
  off(type: string, fn: Function, once?: boolean): void;
  once(type: string, fn: Function): void;
  emit(type: string, args: any): void;
}
