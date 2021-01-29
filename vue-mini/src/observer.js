class Observer {
    constructor(data){
        this.walk(data)
    }

    walk(data){
        // data 不存在 或者 data 不是 object 
        if(!data || typeof data !== 'object'){
            return 
        }
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key])
        })
    }
    defineReactive(data, key, value){
        // 解决问题： 属性是对象，那么属性的属性也应该是响应式数据
        this.walk(value)
        const self = this
        let dep = new Dep()
        Object.defineProperty(data, key, {
             enumerable: true,
             configurable: true,
             get(){
                Dep.target && dep.addSub(Dep.target)
                // 如果没有第三个参数 value, 而是使用 obj[key] 就会发生循环引用报错
                // 为啥 value 使用完没有被释放， 而是依然可以访问呢， 是这里发生了闭包
                return value
             },
             set(newValue){
                 let oldvalue = value
                 if(newValue === oldvalue){
                     return
                 }
                 value = newValue
                //  解决的问题： 重新赋值的对象，也应该被设置成响应式数据
                // 这里是函数内部，this是data对象， 不再是 observer实例， 所以得改一个this
                 self.walk(newValue)
                 dep.notify(oldvalue)
                //  发送数据更新的通知
             }
        })
    }
}