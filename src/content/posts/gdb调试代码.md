---
title: 'gdb调试代码'
date: 2019-01-01
category: '软件安全'
tags: []
lang: 'zh'
draft: true
---
![image.png](https://upload-images.jianshu.io/upload_images/10651191-bd058ff98f7bd1af.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这是一段奇葩的fork系统调用代码。

准备对此进行调试一番。

先设置一个断点
![image.png](https://upload-images.jianshu.io/upload_images/10651191-653a31b11d4baebd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

r 运行

看到了汇编代码

![image.png](https://upload-images.jianshu.io/upload_images/10651191-22721fa492706889.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

s 步入
![image.png](https://upload-images.jianshu.io/upload_images/10651191-3b9e50a6b416667c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

试一下和 n有什么不同

为啥这个感觉不太一样
![image.png](https://upload-images.jianshu.io/upload_images/10651191-cf1626b8184eadce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

明白了！ s 是单步步入， 应该是进入了内核级别的代码， 所以地址发生了很大的变化
而 n的话， 好像

哦，我是分两次调试代码的， 所以地址是不一样的。

![image.png](https://upload-images.jianshu.io/upload_images/10651191-ef1730d668f14ba9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

---
使用参考

l 显示源代码

disp 显示变量的值
print 打印内部变量的值

watch 监视变量值的变化
bt 查看函数产生的调用栈
