/*
自定义Promise函数模块: IIFE
*/
(function(window) {
  /*
  Promise构造函数
  executor: 执行器函数(同步执行) 内部同步执行 (resolve, reject) => {}
  */
  function Promise(executor) {}

  /**
   *  Promise 原型对象的then()
   * 返回一个新的promise对象
   * 指定成功和失败的回调函数
   * 返回 promise 的结果由 onResolved/onRejected 执行结果决定
   *  */
  Promise.prototype.then = function(onResolved, onRejected) {};

  // function fn(event) {}
  // div.onclick = function (event){
  //   fn(event)
  // }
  // 等价于
  // div.onclick = fn

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
