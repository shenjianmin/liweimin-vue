class Vue {
    constructor(options){
        // 1. 通过属性保存参数选项
        this.$options = options || {}
        this.$data = options.data || {}
        this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
        // 2. 把 data 中的成员转换成 getter/setter 注入到 Vue 实例
        this._proxyData(this.$data)
        this._proxyData(this.$options.methods)
        // 3. 调用 observer 对象， 监听数据的变化
        new Observer(this.$data)
        new Observer(this.$options.methods)
        // 4. 调用 compiler 对象， 解析指令和插值表达式
        new Compiler(this)

    }

    _proxyData(data){
        for (const key in data) {
            Object.defineProperty(this, key, {
                // 可遍历
                enumerable: true,
                // 该属性的描述符才能够被改变, 同时该属性也能从对应的对象上被删除。
                configurable: true,
                get(){
                    return data[key]
                },
                set(newValue){
                    if(newValue === data[key]){
                        return 
                    }
                    data[key] = newValue
                }
            })
        }
    }
}