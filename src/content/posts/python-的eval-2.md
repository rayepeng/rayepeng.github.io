---
title: 'python-的eval？'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
语法：  eval(source[, globals[, locals]]) -> value

参数：

　　　　source：一个Python表达式或函数compile()返回的代码对象

　　　　globals：可选。 变量作用域，全局命名空间，如果被提供，则必须是一个字典对象。

　　　　locals：可选。 变量作用域，局部命名空间，如果被提供，可以是任何映射对象。

我们看到在这段代码中

eval 本来是str的转化为了list和 dict

![](https://upload-images.jianshu.io/upload_images/10651191-1ddf7f80a236884c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们再来看一下这个页面的逻辑

> ?action:index;True%23False

![](https://upload-images.jianshu.io/upload_images/10651191-8a11592f1ceb5ec1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-cc77e697c516dc5c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这段?之后的东东 是 以action开头的 所以is_action = True

拼接出的函数就是 index_handler

![](https://upload-images.jianshu.io/upload_images/10651191-5c00b18f51b6561e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们可以再捋一下这段代码的逻辑

首先event 的每个字符都必须有效

event[0]  == 'a'

action 得到:和;之间的字符
args得到 

# 的URL编码是 %23

关键是如何让其执行show_flag_funciton函数
