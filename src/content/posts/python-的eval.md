---
title: 'python-的eval'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
DDCT的一道flask题？

刚开始还傻乎乎的觉得是不是传入 `func:show_flag;`就会被执行
![](https://upload-images.jianshu.io/upload_images/10651191-03062b4537cccf85.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们从入口点开始看起， 看看从我们传入URL的参数开始， 是怎么到这个函数的

这里加入了一个判断， 也就是说`querystring`必须是非空， 长度小于等于100， 且必须以`action:`开头的

![](https://upload-images.jianshu.io/upload_images/10651191-4ff6443050489594.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

所以如果是直接构造 `func:show_flag`是不可能地

之后调用了 `trigger_event`这个函数
![](https://upload-images.jianshu.io/upload_images/10651191-8219af2de574ae95.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这个函数会将`querystring`添加到 `event_queue`中

![](https://upload-images.jianshu.io/upload_images/10651191-9c307b888182325f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里对`querystring`进行了类型判断， 从URL中传入的都是str类型， 而代码内部的调用传入的都是 list类型(其实也不能这么说，。。

比如这几处地方

![](https://upload-images.jianshu.io/upload_images/10651191-2f96963c363ac0a3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-fa2eb962d78cac6c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果要执行eval函数
1. 必须在`request.event_queue`中， 也就是在这之前必须调用`trigger_event`函数
2. `event`必须以`action`或者`func`开头
3. 必须是合法的字符

![](https://upload-images.jianshu.io/upload_images/10651191-1f60bdb59fb0e6fe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

所以要如何达到任意函数执行的目的呢？

先想办法调用`trigger_event`函数再说

查了一下网上关于eval的例子。
大部分都是通过eval对用户的输入过滤不严导致的

\# 注释符要怎么用呢。
![](https://upload-images.jianshu.io/upload_images/10651191-dd6a051cc75b2b75.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

还是不太明白如何调用的。
