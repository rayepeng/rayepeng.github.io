---
title: 'spring-MVC'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
DispatchServlet & HandlerAdapter

核心是通过DispatchServlet来实现的
![](https://upload-images.jianshu.io/upload_images/10651191-005d39cd5a9ec908.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Handler是在内部使用的类

在DispatchServlet实际调用的是Handler而不是control

HandlerInterceptor 是一个interface

HandlerMapping
帮助DispatchServlet去得到正确的controller

![](https://upload-images.jianshu.io/upload_images/10651191-9a6be6a7bfaff259.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

HandlerExecutionChain
执行链条

![](https://upload-images.jianshu.io/upload_images/10651191-90c3c5d19e0c6dde.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

ModelAndView
ViewReslover

一次请求和响应的过程

![](https://upload-images.jianshu.io/upload_images/10651191-8f44c56d84cf5181.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
