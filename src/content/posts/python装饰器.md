---
title: 'python装饰器'
date: 2019-01-01
category: 'python'
tags: []
lang: 'zh'
draft: true
---
装饰器本质上就是一个函数

突然理解了装饰器的本质

```
 my_log(func):
    def wrapper():
        print("hello world")
        func()

    return wrapper

@my_log
def run():
    print("run")

run()
```

其实就是一个包装的函数而已
