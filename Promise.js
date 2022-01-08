function Promise(executor) {

    this.PromiseState = 'pending'
    this.PromiseResult = null
    this.callbacks = []

    let resolve = (data) => {
        if (this.PromiseState === 'pending') {
            this.PromiseState = 'fulfilled'
            this.PromiseResult = data
            this.callbacks.forEach(item => {
                item.onResolved(data)
            })
        }
    }

    let reject = (reason) => {
        if (this.PromiseState === 'pending') {
            this.PromiseState = 'rejected'
            this.PromiseResult = reason
            this.callbacks.forEach(item => {
                item.onRejected(reason)
            })
        }
    }
    // 执行器
    try {
        executor(resolve, reject)
    } catch (e) {
        reject(e)
    }
}

Promise.prototype.then = function (onResolved, onRejected) {
    // 当前调用.then方法的对象的PromiseState为rejected并且.then方法没有onRejected形参
    // 自定义onRejected抛出异常，并且异常值为当前对象的PromiseResult，
    // 新生成的Promise的PromiseState依旧为rejected,PromiseResult为异常值，
    // 从而达到传递异常的作用
    if (typeof onRejected !== 'function') {
        onRejected = reason => { throw reason }
    }
    // 当.then()中没有形参时，
    // 指定默认的onResolved和onRejected,
    // 以达到传递值的作用
    if (typeof onResolved !== 'function') {
        onResolved = data => data
    }

    return new Promise((resolve, reject) => {
        let callback = (type) => {
            try {
                let result = type(this.PromiseResult)
                if (result instanceof Promise) {
                    result.then(onRes => { resolve(onRes) }, onRej => { reject(onRej) })
                } else {
                    resolve(result)
                }
            } catch (e) {
                reject(e)
            }
        }
        if (this.PromiseState === 'fulfilled') {
            callback(onResolved)
        }
        if (this.PromiseState === 'rejected') {
            callback(onRejected)
        }

        if (this.PromiseState === 'pending') {
            this.callbacks.push({
                onResolved: () => {
                    callback(onResolved)
                },
                onRejected: () => {
                    callback(onRejected)
                }
            })
        }
    })
}

Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected)
}

Promise.resolve = function (data) {
    return new Promise((resolve, reject) => {
        if (data instanceof Promise) {
            data.then(onRes => { resolve(onRes) }, onRej => { reject(onRej) })
        }else {
            resolve(data)
        }
    })
}

Promise.reject = function (data) {
    return new Promise((undefined, reject) => {
        throw data
    })
}
