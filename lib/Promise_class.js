/*
自定义Promise函数模块: IIFE
*/
(function(window) {
  const PENDING = "pending";
  const RESOLVED = "resolved";
  const REJECTED = "rejected";

  class Promise {
    /**
     *Promise构造函数
     *executor: 执行器函数(同步执行) 内部同步执行 (resolve, reject) => {}
     */
    constructor(executor) {
      // 将当前promise对象保存起来
      const self = this;
      self.status = PENDING; // 给 promise 对象指定 status属性, 初始值为pending
      self.data = undefined; // 给promise对象指定一个用于存储结果数据的属性
      self.callbacks = []; // 每个元素的结构: { onResolved() {}, onRejected() {}}

      function resolve(value) {
        // 如果当前状态不是pending, 直接结束
        if (self.status !== PENDING) {
          return;
        }

        // 将状态改为resolved
        self.status = RESOLVED;
        // 保存value数据
        self.data = value;
        // 如果有待执行callback函数, 立即异步执行回调函数onResolved
        if (self.callbacks.length > 0) {
          // 放入队列中执行所有成功的回调
          setTimeout(() => {
            self.callbacks.forEach(callbacksObj => {
              callbacksObj.onResolved(value);
            });
          });
        }
      }

      function reject(reason) {
        // 如果当前状态不是pending, 直接结束
        if (self.status !== PENDING) {
          return;
        }

        // 将状态改为rejected
        self.status = REJECTED;
        // 保存value数据
        self.data = reason;
        // 如果有待执行callback函数, 立即异步执行回调函数onRejected
        if (self.callbacks.length > 0) {
          // 放入队列中执行所有成功的回调
          setTimeout(() => {
            self.callbacks.forEach(callbacksObj => {
              callbacksObj.onRejected(reason);
            });
          });
        }
      }

      // 立即同步执行 executor
      try {
        executor(resolve, reject);
      } catch (error) {
        // 如果执行器抛出异常, promise 对象变为 rejected状态
        reject(error);
      }
    }

    /**
     *  Promise 原型对象的then()
     * 返回一个新的promise对象
     * 指定成功和失败的回调函数
     * 返回 promise 的结果由 onResolved/onRejected 执行结果决定
     *  */
    then(onResolved, onRejected) {
      const self = this;

      // 指定回调函数的默认值(必须是函数)
      onResolved =
        typeof onResolved === "function" ? onResolved : value => value;
      onRejected =
        typeof onRejected === "function"
          ? onRejected
          : reason => {
              throw reason;
            };

      // 返回一个新的promise
      return new Promise((resolve, reject) => {
        /**
         * 执行指定的回调函数
         * 根据执行的结果改变 return 的 promise的状态/数据
         */
        function handle(callback) {
          /**
           * 返回 promise 的结果由 onResolved/onRejected 执行结果决定
           * 1. 抛出异常, 返回promise的结果为失败, reason为异常
           * 2. 返回的是promise, 返回promise的结果就是这个结果
           * 3. 返回的不是promise, 返回promise为成功, value就是返回值
           */
          try {
            const result = callback(self.data);
            // 2. 返回的是promise, 返回promise的结果就是这个结果
            if (result instanceof Promise) {
              // result.then(
              //   // 当result 成功时，让 result的 promise 也成功
              //   value => resolve(value),
              //   // 当result 失败时，让 result的 promise 也失败
              //   reason => reject(reason)
              // );
              result.then(resolve, reject);
            } else {
              // 3. 返回的不是promise, 返回promise为成功, value就是返回值
              resolve(result);
            }
          } catch (error) {
            // 1. 抛出异常, 返回promise的结果为失败, reason为异常
            reject(error);
          }
        }

        if (self.status === RESOLVED) {
          // 当前 promise 的状态是 resolved
          // 立即异步执行成功的回调函数
          setTimeout(() => {
            handle(onResolved);
          });
        } else if (self.status === REJECTED) {
          // 当前 promise 的状态是 rejected
          // 立即异步执行失败的回调函数
          setTimeout(() => {
            handle(onRejected);
          });
        } else {
          // 当前 promise的状态是 pending
          // 将成功和失败的回调函数保存callbacks容器中缓存起来
          self.callbacks.push({
            onResolved(value) {
              handle(onResolved);
            },
            onRejected(reason) {
              handle(onRejected);
            }
          });
        }
      });
    }

    /**
     *Promise 原型对象的catch()
     *指定失败的回调函数
     * 返回一个新的promise对象
     */
    catch(onRejected) {
      return this.then(undefined, onRejected);
    }

    /**
     *  Promise函数对象的 resolve方法
     * 返回一个指定结果的成功的promise
     */
    static resolve(value) {
      // 返回一个成功/失败的promise
      return new Promise((resolve, reject) => {
        // value 是 promise
        if (value instanceof Promise) {
          // 使用 value 的结果作为 promise的结果
          value.then(resolve, reject);
        } else {
          // value 不是 promise  => promise变为成功, 数据是value
          resolve(value);
        }
      });
    }

    /**
     * Promise 函数对象的 reject 方法
     * 返回一个指定 reason 的失败的 promise
     */
    static reject(reason) {
      // 返回一个失败的promise
      return new Promise((resolve, reject) => {
        reject(reason);
      });
    }

    /**
     * Promise 函数对象的 all 方法
     * 返回一个promise, 只有当所有 promise 都成功时才成功, 否则只要有一个失败的就失败
     */
    static all(promises) {
      // 用来保存所有成功value的数组(创建指定长度的数组)
      const values = new Array(promises.length);
      // 用来保存成功promise的数量
      let resolvedCount = 0;
      // 返回一个新的promise
      return new Promise((resolve, reject) => {
        // 遍历 promises 获取每个promise的结果
        promises.forEach((p, index) => {
          Promise.resolve(p).then(
            value => {
              resolvedCount++; // 成功的数量加1
              // p成功, 将成功的 value 保存 values
              // values.push(value)
              values[index] = value;
              // 如果全部成功了, 将 return 的 promise改变成功
              if (resolvedCount === promises.length) {
                resolve(values);
              }
            },
            // 只要一个失败了, return 的promise就失败
            reason => {
              reject(reason);
            }
          );
        });
      });
    }

    /**
     * Promise 函数对象的 race 方法
     * TODO 完成的
     * 返回一个promise, 其结果由第一个完成的promise决定
     */
    static race(promises) {
      // 返回一个promise
      return new Promise((resolve, reject) => {
        // 遍历 promises 获取每个 promise的结果
        promises.forEach((p, index) => {
          Promise.resolve(p).then(
            value => {
              // 一旦有成功了, 将return变为成功
              resolve(value);
            },
            reason => {
              // 一旦有失败了, 将return变为失败
              reject(reason);
            }
          );
        });
      });
    }

    /**
     *返回一个promise对象, 它在指定的时间后才确定结果
     */
    static resolveDelay(value, time) {
      // 返回一个成功/失败的promise
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // value 是 promise
          if (value instanceof Promise) {
            // 使用 value 的结果作为 promise的结果
            value.then(resolve, reject);
          } else {
            // value 不是 promise  => promise变为成功, 数据是value
            resolve(value);
          }
        }, time);
      });
    }

    /**
     *返回一个promise对象, 它在指定的时间后才失败
     */
    static rejectDelay(reason, time) {
      // 返回一个失败的promise
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(reason);
        }, time);
      });
    }
  }
  // 暴露构造函数
  window.Promise = Promise;
})(window);
