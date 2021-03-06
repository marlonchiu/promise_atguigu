/*
自定义Promise函数模块: IIFE
*/
(function(window) {
  const PENDING = "pending";
  const RESOLVED = "resolved";
  const REJECTED = "rejected";

  /*
  Promise构造函数
  executor: 执行器函数(同步执行) 内部同步执行 (resolve, reject) => {}
  */
  function Promise(executor) {
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
  Promise.prototype.then = function(onResolved, onRejected) {};

  /*
  Promise 原型对象的catch()
  指定失败的回调函数
  返回一个新的promise对象
  */
  Promise.prototype.catch = function(onRejected) {};

  /**
   *  Promise函数对象的 resolve方法
   * 返回一个指定结果的成功的promise
   */
  Promise.resolve = function(value) {};

  /**
   * Promise 函数对象的 reject 方法
   * 返回一个指定 reason 的失败的 promise
   */
  Promise.reject = function(reason) {};

  /**
   * Promise 函数对象的 all 方法
   * 返回一个promise, 只有当所有 promise 都成功时才成功, 否则只要有一个失败的就失败
   */
  Promise.all = function(promises) {};

  /**
   * Promise 函数对象的 race 方法
   * TODO 完成的
   * 返回一个promise, 其结果由第一个完成的promise决定
   */
  Promise.race = function(promises) {};

  // 暴露构造函数
  window.Promise = Promise;
})(window);
