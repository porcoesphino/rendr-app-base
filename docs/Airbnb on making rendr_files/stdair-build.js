!function() {
  var ENV = {
    COMMONJS: false,
    ENDER: false,
    either: function(commonjs, ender) {
      if (!ENV.ENDER || !ender) return commonjs;
      return ender;
    },
    run: function(commonjs, ender) {
      return ENV.either(commonjs, ender)();
    }
  };

  if (typeof module !== 'undefined' && typeof require !== 'undefined') {
    ENV.COMMONJS = true;
  } else if (typeof require !== 'undefined' && typeof provide !== 'undefined') {
    ENV.ENDER = true;
  }

  ENV.run(
    function() { module.exports = ENV; },
    function() { provide('std::env', ENV); }
  );
}();
!function() {

  /*
   * Basic utilities added to underscore.
   * ====================================
   *
   * Returns the monkey-patched underscore
   * object, so to use patched underscore
   * just require this file.
   */

  var _ = require('underscore');

  _.mixin({

    /*
     * args
     * ----
     * 
     * Given an `arguments` object and optional
     * `start` and `end` indices, converts the
     * `arguments` object into an array and returns
     * the slice of the range from `start` to `end`
     * in the array.
     *
     * If `end` is unspecified, it will slice to
     * the end of the array. If `start` is unspecified,
     * it will start the slice at the beginning of the
     * array.
     */

    args: function(args, start, end) {
      if(!start) start = 0;
      if(!end) end = args.length;
      return Array.prototype.slice.call(args, start, end);
    },


    /*
     * log
     * ---
     *
     * A safe logging function that won't blow up IE.
     * Returns the `msg` parameter given to it.
     */

    log: function(msg) {
      if(typeof console !== 'undefined' && console.log) console.log(msg);
      return msg;
    },


    /*
     * inherit
     * -------
     * 
     * Takes a base class and a derived class,
     * and sets up native JS class inheritance
     * between them.
     *
     * Returns the derived class.
     */

    inherit: (function() {
      var Temp = function() {};
      return function(Base, Derived) {
        Temp.prototype = Base.prototype;
        Derived.prototype = new Temp(); 
        Derived.prototype.constructor = Derived;
        _.extend(Derived, Base);
        return Derived;
      };
    }()),


    /*
     * nextTick
     * --------
     *
     * Given a callback, executes it next time
     * the event queue is empty.
     */

    nextTick: function(callback) {
      if(typeof process !== 'undefined' && process.nextTick) process.nextTick(callback);
      else if(typeof window !== 'undefined' && window.setImmediate) window.setImmediate(callback);
      else setTimeout(callback, 0);
    },


    /*
     * combine
     * -------
     * 
     * Combines multiple functions with the
     * same signature into one. Can take
     * an argument list, an array of functions,
     * or a combination of both.
     *
     * Please note: the combined function
     * will not return anything!
     */

    combine: function() {
      var fns = _.chain(arguments)
                  .args()
                  .flatten()
                  .value()
      return function() {
        var args = _.args(arguments),
            index = 0,
            length = fns.length;
        for(index, length; index < length; index++) {
          fns[index].apply(null, args);
        }
      };
    },

    /*
     * callback
     * --------
     *
     * Safely calls callbacks given to it.
     * If the callback is undefined, it
     * won't be called.
     *
     * Works as either a safe `call` or
     * a safe `apply`: can take either arg
     * lists or arrays.
     *
     * Takes an optional context parameter
     * as its first argument.
     */

    callback: function() {
      var args = _.chain(arguments)
                  .args()
                  .flatten()
                  .hashify()
                  .value()
                    .optional('ctx', null, {type: 'object'})
                    .required('callback')
                    .many('rest')
                    .end;
      if(args.callback) args.callback.apply(args.ctx, args.rest);
    },


    /*
     * hashify
     * -------
     * 
     * Oxygen port of @reissbaker's parseArgs
     * library.
     *
     * Takes a Collection (array or arguments
     * object) and turns it into an array through
     * repeated chained calls to `required`,
     * `optional`, and `many`.
     *
     * At the end of the chain, finish it off
     * by accessing the `end` property.
     */

    hashify: (function() {
      var propCheck = function(propName, check, truthFn) {
        var val, 
            invert = false;
        if(_.has(check, propName)) {
          val = check[propName];
          if(typeof val === 'object' && _.has(val, 'not')) {
            val = val[propName];
            invert = true;
          }
          return !(invert === truthFn(val));
        }
        return true;
      };

      var checkArgument = function(arg, index, args, check) {
        var passed = true,
            LENGTH = 'length',
            GTLENGTH = '>' + LENGTH,
            GTELENGTH = '>=' + LENGTH,
            LTLENGTH = '<' + LENGTH,
            LTELENGTH = '<=' + LENGTH;

        if(typeof check === 'function') return check(arg, index, args);
        if(typeof check === 'boolean') return check;

        passed = propCheck('type', check, function(val) { return typeof arg === val; });
        passed = passed && propCheck('instance', check, function(val) { return arg instanceof val; });
        passed = passed && propCheck(LENGTH, check, function(val) { return args.length === val; });
        passed = passed && propCheck(GTLENGTH, check, function(val) { return args.length > val; });
        passed = passed && propCheck(GTELENGTH, check, function(val) { return args.length >= val; });
        passed = passed && propCheck(LTLENGTH, check, function(val) { return args.length < val; });
        passed = passed && propCheck(LTELENGTH, check, function(val) { return args.length <= val; });

        return passed;
      };

      return function(args) {
        var next = 0;
        if(!_.isArray(args)) args = _.args(args);

        return {

          /*
           * All parsed variables are saved here.
           */

          end: {},


          /*
           * Takes a name.
           *
           * Saves the next occuring variable into
           * the `end` hash under the name given.
           */

          required: function(name) {
            this.end[name] = args[next];
            next++;
            return this;
          },

          /*
           * Takes a name, default value, and a check.
           * The check can either be a predicate function
           * that takes an arg and returns true or false,
           * or a hash with `instance` or `type` keys set
           * to something that an instanceof or typeof
           * check will run against.
           *
           * Saves the next occuring variable into the
           * `end` hash if it passes the check. Otherwise,
           * saves the default value.
           */

          optional: function(name, defaultValue, check) {
            var curr = args[next],
                value = defaultValue,
                passed = checkArgument(curr, next, args, check);

            if(passed) {
              next++;
              value = curr;
            }

            this.end[name] = value;
            return this;
          },

          /*
           * Takes a name and a check. Like `optional`,
           * the check can either be a predicate function
           * or a hash with `instance` or `type` keys.
           *
           * Saves all variables starting from the next
           * occuring one into an array, until one of
           * them fails the check.
           *
           * If the first variable given fails, saves
           * and empty array.
           */

          many: function(name, check) {
            var curr,
                values = [],
                passed = true;
            
            if(check) {
              while(passed && next < args.length) {
                curr = args[next];
                passed = checkArgument(curr, next, args, check);
                if(passed) {
                  next++;
                  values.push(curr);
                }
              }
            } else {
              values = args.slice(next);
            }

            this.end[name] = values;
            return this;
          }
        };
      };
    }())
  });

  if(typeof provide !== 'undefined') provide('std::utils', _);
  else module.exports = _;
}();
!function() {
  
  /*
   * EventEmitter
   * ============
   * 
   * Port of Node.js's EventEmitter class.
   */

  // cross-platform dependencies
  var ENV = typeof provide === 'undefined' ? require('./env') : require('std::env');
  var _ = require(ENV.either('./utils', 'std::utils'));

  var EventEmitter = function() {
    this._events = {};
    this._maxListeners = 10;
  };

  EventEmitter.prototype.listeners = function(evt) {
    if(!this._events[evt]) this._events[evt] = [];
    return this._events[evt];
  };

  EventEmitter.prototype.setMaxListeners = function(max) {
    this._maxListeners = max;
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener = function(evt, handler) {
    this.emit('newListener', handler);
    var listeners = this.listeners(evt);
    listeners.push(handler);
    if(listeners.length >= this._maxListeners) {
      _.log('Warning: ' + this + ' has more than ' + 
        this._maxListeners + ' attached to event ' + 
        evt + '.');
    }
    return this;
  };

  EventEmitter.prototype.once = function(evt, handler) {
    var wrapper = {listener: handler};
    this.listeners(evt).push(wrapper);
    this.emit('newListener', wrapper);
    return this;
  };

  EventEmitter.prototype.removeListener = function(evt, handler) {
    var index,
        listeners = this.listeners(evt);
    for(index = 0; index < listeners.length; index++) {
      if(listeners[index] === handler) {
        listeners.splice(index, 1);
        break;
      }
    }
    return this;
  };

  EventEmitter.prototype.removeAllListeners = function(evt) {
    this._events[evt] = [];
    return this;
  };

  EventEmitter.prototype.emit = function() {
    var index, curr,
        evt = arguments[0],
        args = _.args(arguments, 1),
        listeners = this._events[evt] || [],
        any = listeners.length !== 0,
        clean = [];

    for(index = 0; index < listeners.length; index++) {
      curr = listeners[index];
      if(typeof curr === 'object') {
        clean.push(index);
        curr = curr.listener;
      }
      curr.apply(this, args);
    }

    for(index = 0; index < clean.length; index++) {
      listeners.splice(clean[index] - index, 1);
    }

    return any;
  };

  ENV.run(
    function() { module.exports = EventEmitter; },
    function() { provide('std::emitter', EventEmitter); }
  );
}();
!function() {

  /*
   * Wait
   * ====
   * Ported from @reissbaker's Heavy Flow library.
   */

  var ENV = require(typeof provide === 'undefined' ? './env' : 'std::env');
  var _ = require(ENV.either('./utils', 'std::utils'));
  var EventEmitter = ENV.run(
    function() { return require('events').EventEmitter; },
    function() { return require('std::emitter'); }
  );

  var DONE_EVT = 'done',
      CANCEL_EVT = 'cancel';

  /*
   */

  var FlowObject = function(dependencies, callback) {
    var index, length, dep, guts, depDone,
        isCancelled = false,
        isReady = true,
        err = null;
    this._internal = {
      emitter: new EventEmitter(),
      count: 0,
      isDone: false,
      isCancelled: false,
      err: null,
      data: null,
      callback: callback
    };

    for(index = 0, length = dependencies.length; index < length; index++) {
      dep = dependencies[index];
      guts = dep._internal;
      isCancelled = isCancelled || guts.isCancelled;
      err = guts.err;
      depDone = guts.isDone && !isCancelled;
      isReady = isReady && depDone;
      if(isCancelled) break;
      if(!depDone) {
        this._internal.count++;
        dep.done(buildNotify(this));
        dep.cancel(buildCancel(this));
      } 
    }

    if(isReady) callDeferred(this);
    if(isCancelled) cancel(this, err);
  };

  /*
   * Public methods.
   * ===============
   */

  /*
   * Getters.
   */

  FlowObject.prototype.isDone = function() { return this._internal.isDone; };
  FlowObject.prototype.isCancelled = function() { return this._internal.isCancelled; };
  FlowObject.prototype.error = function() { return this._internal.err; };
  FlowObject.prototype.data = function() { return this._internal.data; };

  /*
   * Attach handlers.
   */

  FlowObject.prototype.done = function(fn) {
    var guts = this._internal;
    if(!guts.isCancelled) {
      fn = _.bind(fn, this);
      if(guts.isDone) fn(guts.data);
      else guts.emitter.on(DONE_EVT, fn);
    }
    return this;
  };
  FlowObject.prototype.cancel = function(fn) {
    var guts = this._internal;
    if(!guts.isDone) {
      fn = _.bind(fn, this);
      if(guts.isCancelled) fn(guts.err);
      else guts.emitter.on(CANCEL_EVT, fn);
    }
    return this;
  };


  /*
   * Remove handlers.
   */

  FlowObject.prototype.removeDone = function(fn) {
    this._internal.emitter.removeListener(DONE_EVT, fn);
  };
  FlowObject.prototype.removeCancelled = function(fn) {
    this._internal.emitter.removeListener(CANCEL_EVT, fn);
  };

  
  /*
   * Private methods.
   * ================
   */
  
  var callDeferred = function(waiting) {
    var guts = waiting._internal;

    if(!guts.isCancelled && !guts.isDone) {
      guts.callback.call(waiting, doneCallback(waiting), cancelCallback(waiting));
    }
  };

  var notify = function(waiting) {
    var guts = waiting._internal;
    
    guts.count--;
    if(guts.count === 0) callDeferred(waiting);
  };

  var done = function(waiting, data) {
    var guts = waiting._internal;
    if(guts.isDone || guts.isCancelled) return;

    guts.isDone = true;
    guts.data = data;
    guts.emitter.emit(DONE_EVT, data);
    guts.emitter = new EventEmitter();
  };

  var cancel = function(waiting, err) {
    var guts = waiting._internal;
    if(guts.isDone || guts.isCancelled) return;

    guts.isCancelled = true;
    guts.err = err;
    guts.emitter.emit(CANCEL_EVT, err);
    guts.emitter = new EventEmitter();
  };

  var buildNotify = function(waiting) {
    return _.once(function() {
      notify(waiting);
    });
  };

  var buildCancel = function(waiting) {
    return _.once(function(err) {
      cancel(waiting, err);
    });
  };


  /*
   * Build the callbacks that get passed
   * to promised functions.
   */

  var doneCallback = function(waiting) {
    return _.once(function(data) {
      done(waiting, data);
    });
  };

  var cancelCallback = function(waiting) {
    return _.once(function(err) {
      cancel(waiting, err);
    });
  };


  /*
   * Factory function.
   * =================
   */

  var flow = function() {
    var args = _.chain(arguments)
                .args()
                .flatten()
                .hashify()
                .value()
                  .many('dependencies', {instance: FlowObject})
                  .required('callback')
                  .end;
    return new FlowObject(args.dependencies, args.callback);
  };


  /*
   * Export everything.
   */

  ENV.run(
    function() { module.exports = flow; },
    function() { provide('std::wait', flow); }
  );
}();
!function() {

  /*
   * AsyncQueue
   * ----------
   * run asynchronous functions
   * serially.
   *
   * enqueue an async function
   * into the queue with enqueue.
   * the function will get called
   * when it's ready with a done()
   * callback passed in as the first
   * arg and a cancel() callback as
   * its second, much like std::wait
   * calls (async queues are in
   * fact thin wrappers around
   * std::wait objects).
   *
   * when the async call completes,
   * call done(), and the next
   * function in line will run.
   *
   * cancelling will cancel ALL
   * queued functions: each function
   * in the queue depends on the prior
   * one's completion. if your
   * async function errors out, but
   * you can handle the error and
   * want to keep running the queued
   * functions: handle the error,
   * and call done(). don't cancel
   * unless you really mean it.
   */

  
  var ENV = require(typeof provide === 'undefined' ? './env' : 'std::env');
  var wait = require(ENV.either('./wait', 'std::wait'));

  var AsyncQueue = function() {
    this._internal = {
      promise: wait(function(done) { done(); })
    };
  };
  
  AsyncQueue.prototype.enqueue = function(fn) {
    var guts = this._internal;
    var promise = guts.promise = wait(guts.promise, fn);

    // if it cancels, make sure to reset the
    // main promise object
    promise.cancel(function() {
      if(guts.promise === this) {
        guts.promise = wait(function(done) { done(); });
      }
    });

    return promise;
  };

  AsyncQueue.prototype.top = function() {
    return this._internal.promise;
  };

  if(typeof provide === 'undefined') module.exports = AsyncQueue;
  else provide('std::async-queue', AsyncQueue);
}();
!function() {
  var ENV = require(typeof provide === 'undefined' ? './env' : 'std::env');
  var EventEmitter = ENV.run(
    function() { return require('events').EventEmitter; },
    function() { return require('std::emitter'); }
  );
  var _ = require(ENV.either('./utils', 'std::utils')),
      wait = require(ENV.either('./wait', 'std::wait'));

  var SET_PREFIX = 'set:',
      DESTROY_PREFIX = 'destroy:',
      INVALIDATE_PREFIX = 'invalidate:',
      CHANGE_PREFIX = 'change:';

  var Cache = _.inherit(EventEmitter, function() {
    EventEmitter.call(this);
    this._data = {};
    this._loading = {};
    init(this);
  });

  Cache.serialize = function(property, serializers) {
    var type, propSerializer;

    this.serial = this.serial || {};
    propSerializer = this.serial[property] = this.serial[property] || {};
    for(type in serializers) {
      if(_.has(serializers, type)) propSerializer[type] = serializers[type];
    }
  };

  Cache.prototype.get = function(key, callback) {
    if(callback) {
      if(this._data.hasOwnProperty(key)) callback(null, this._data[key]);
      else this.load(key, callback);
    } else {
      return waitForAndGet(this, [], key);
    }
  };

  function waitForAndGet(cache, deps, property) {
    var promise = wait(deps, function(done, cancel) {
      cache = typeof cache === 'function' ? cache() : cache;
      cache.get(property, function(err, data) {
        err ? cancel(err) : done(data);
      });
    });
    promise.get = function(key, callback) {
      var cacheFn = function() { return promise.data(); };
      if(key && callback) {
        promise.done(function(data) {
          cacheFn().get(key, callback);
        });
        promise.cancel(function(err) {
          callback(err);
        });
        return;
      }
      return waitForAndGet(cacheFn, [promise], key);
    };

    return promise;
  }

  Cache.prototype.invalidate = function(key, callback) {
    var ref = this;
    if(_.has(this._data, key)) delete this._data[key];
    var request = wait(function(done, cancel) {
      ref.load(key, function(err, data) {
        if(err) cancel(err);
        else done(data);
        if(callback) callback(err, data);
      });
    });
    this.emit(INVALIDATE_PREFIX + key, request);

  };

  Cache.prototype.load = function(key, callback) {
    var ref = this,
        oldVal = this._data[key];

    if(this._loading[key]) {
      this._loading[key].push(callback);
      return;
    }

    this._loading[key] = [];
    if(callback) this._loading[key].push(callback);

    callSerializer(this, 'get', key, function(err, data) {
      if(!err) {
        ref._data[key] = data;
        ref.emit(CHANGE_PREFIX + key, oldVal, data);
        _.each(ref._loading[key], function(callback) { callback.call(ref, null, data); });
      } else {
        _.each(ref._loading[key], function(callback) { callback.call(ref, err); });
      }
      delete ref._loading[key];
    });
  };

  Cache.prototype.set = function(key, value, callback) {
    var oldVal = this._data[key];
    if(oldVal !== value) {
      this._data[key] = value;
      this.emit(SET_PREFIX + key, oldVal, value);
      this.emit(CHANGE_PREFIX + key, oldVal, value);
      callSerializer(this, 'set', key, callback);
    } else {
      _.callback(callback, null, value);
    }
  };

  Cache.prototype.destroy = function(key, callback) {
    if(this._data.hasOwnProperty(key)) {
      delete this._data[key];
      this.emit(DESTROY_PREFIX + key, value);
      callSerializer(this, 'destroy', key, callback);
    } else {
      _.callback(callback, null);
    }
  };

  var init = function(cache) {
    var prop, propSerializer,
        CacheClass = cache.constructor,
        serial = CacheClass.serial;
    if(serial) {
      for(prop in serial) {
        if(_.has(serial, prop)) initProp(cache, serial[prop], prop);
      }
    }
  };

  var initProp = function(cache, propSerializer, prop) {
    if(_.has(propSerializer, 'init')) {
      propSerializer.init.call(cache, function(err, data) {
        if(!err) cache._data[prop] = data;
        else _.log(err);
      });
    }
  };

  var callSerializer = function(cache, type, key, callback) {
    var propSerializer,
        CacheClass = cache.constructor,
        serial = CacheClass.serial;
    if(serial) {
      if(_.has(serial, key)) {
        propSerializer = serial[key];
        if(_.has(propSerializer, type)) {
          _.nextTick(function() {
            propSerializer[type].call(cache, callback);
          });
          return;
        }
      }
    }

    _.nextTick(function() { _.callback(cache, callback, 'No serializer!', null); });
  };


  ENV.run(
    function() { module.exports = Cache; },
    function() { provide('std::cache', Cache); }
  );

}();
!function() {

  /*
   * Alarm
   * =====
   *
   * easy way to set up recurring
   * events.
   *
   * inherits from EventEmitter,
   * so you can just attach a
   * handler to the alarm's `tick`
   * event.
   */

  var ENV = require(typeof provide === 'undefined' ? './env' : 'std::env');
  var EventEmitter = ENV.run(
    function() { return require('events').EventEmitter; },
    function() { return require('std::emitter'); }
  );
  var _ = require(ENV.either('./utils', 'std::utils'));

  /*
   * Constructor
   * -----------
   */

  var Alarm = _.inherit(EventEmitter, function(time, looping) {
    EventEmitter.call(this);

    this.time = time || 0;
    this._internal = {
      on: false,
      looping: looping || false
    };
  });

  /*
   * Public methods
   * --------------
   */

  Alarm.prototype.start = function() {
    if(!this._internal.on) {
      this._internal.on = true;
      this._internal.countdown = 0;
      this.emit('start');
      tick(this, this.time);
    }
  };

  Alarm.prototype.stop = function() {
    if(this._internal.on) {
      this._internal.on = false;
      this._internal.countdown = 0;
      this.emit('stop');
    }
  };


  /*
   * Private methods
   * ---------------
   */

  var tick = function(alarm, time) {
    var prevTime = new Date;
    setTimeout(function() {
      var delta = (new Date) - prevTime,
          guts = alarm._internal;
      if(guts.on) {
        alarm.emit('tick', delta, time);
        if(guts.looping) tick(alarm, time);
        else alarm.stop();
      }
    }, time);
  };

  /*
   * Export
   */

  ENV.run(
    function() {module.exports = Alarm;},
    function() { provide('std::alarm', Alarm); }
  );
}();
!function() {
  var ENV = require(typeof provide === 'undefined' ? './env' : 'std::env');
  var Alarm = ENV.run(
    function() { return require('./alarm'); },
    function() { return require('std::alarm'); }
  );

  function Timing(granularity) {
    this._internal = {
      a: new Alarm(granularity, true)
    };

    this._internal.a.start()
  }

  Timing.prototype.setInterval = function(handler, time) {
    var wrapper = buildWrapper(handler, time);
    this._internal.a.on('tick', wrapper);
    return wrapper;
  };

  Timing.prototype.clearInterval = function(handler) {
    this._internal.a.removeListener('tick', handler);
  };

  Timing.prototype.setTimeout = function(handler, time) {
    var ref = this;
    var wrapper = buildWrapper(function() {
      ref._internal.a.removeListener('tick', wrapper);
      handler();
    }, time);
    wrapper._isTimeout = true;
    this._internal.a.on('tick', wrapper);
    return wrapper;
  };

  Timing.prototype.clearTimeout = function(handler) {
    if(handler) {
      this._internal.a.removeListener('tick', handler);
    } else {
      var index, length, curr,
          ls = this._internal.a.listeners('tick'),
          timeouts = [];
      for(index = 0, length = ls.length; index < length; index++) {
        curr = ls[index];
        if(curr._isTimeout) timeouts.push(curr);
      }
      for(index = 0, length = timeouts.length; index < length; index++) {
        this._internal.a.removeListener('tick', timeouts[index]);
      }
    }
  };

  Timing.prototype.start = function() {
    this._internal.a.start();
  };

  Timing.prototype.stop = function() {
    this._internal.a.stop();
  };

  function buildWrapper(handler, time) {
    var elapsed = 0;
    return function(delta) {
      elapsed += delta;
      if(elapsed >= time) {
        elapsed -= time;
        handler();
      }
    }
  }

  ENV.run(
    function() {module.exports = Timing;},
    function() { provide('std::timing', Timing); }
  );
}();
