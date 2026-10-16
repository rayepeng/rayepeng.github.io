---
title: 'PV操作经典习题'
date: 2019-01-01
category: '操作系统'
tags: []
lang: 'zh'
draft: true
---
好经典的一些问题

# 第一题
![](https://upload-images.jianshu.io/upload_images/10651191-07545c6f95964e75.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

显然这个代码完美的解决了进程间同步与互斥的问题

![](https://upload-images.jianshu.io/upload_images/10651191-c2e6db8a7449eece.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-fef6bb133c3b46d8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

所以答案选D

# 第二题

一间酒吧中有3个音乐爱好者， 一个有随身听， 一个有电池， 一个有音乐磁带。 酒吧老板一次出售这三种物品中的任意两种。 当一名音乐爱好者得到三样东西并且听完之后， 酒吧老板才能再一次出售这三种物品。 

使用PV操作解决。

woc我还在想老板怎么解决卖个谁的问题， 没想到这里直接任取两件物品。。 然后符合条件的就卖出去

![](https://upload-images.jianshu.io/upload_images/10651191-2a7c82637c892263.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-0389d84d568b035b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-b2183e331fee7c12.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-0576b62d452af273.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 第三题

![image.png](https://upload-images.jianshu.io/upload_images/10651191-6878e283442e077c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-5397f3a3c5670f2c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-0b8b48248c7f940c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 第四题

![](https://upload-images.jianshu.io/upload_images/10651191-ecf4720d3d6ab517.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-123afaf94c6a45c4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-e2ecc8f9d370414f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 第五题

![](https://upload-images.jianshu.io/upload_images/10651191-dfc76bb7dd461f9a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-70fd14f9a89a2194.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 第六题
考试的一道题，虽然考前的一张试卷上出现了，但是我却没有看到，有点桑心

三个工人，一个生产车轮，一个生产车架，一个将一个车架与两个车轮组装起来。

原始的题目给的代码如下：
```c
//工人1
生产车架
P(empty)
将车架放入工作台
V(frame)

//工人2
生产车轮
P(empty)
将车轮放入工作台
V(wheel)

//工人三
P(frame)
取一个车架
V(empty)
P(wheel)
P(wheel)
取两个车轮
V(empty)
V(empty)
组装一台车

```
这段代码十存在死锁问题的，因为如果一个工人连续生产车轮或者车架，直到占满了工作区，这就导致三个工人无法继续工作

所以修改代码如下：
```c
//工人1
生产车架
P(s1)
P(empty)
将车架放入工作台
V(frame)

//工人2
生产车轮
P(s2)
P(empty)
将车轮放入工作台
V(wheel)

//工人三
P(frame)
取一个车架
V(empty)
P(wheel)
P(wheel)
取两个车轮
V(empty)
V(empty)
V(s1)
V(s2)
组装一台车

```

车架的数量不超过N-1
车轮的数量不超过N-2

也就是s1 = N-1,s2 = N-2

通过这种方式来限制工人的生产数量。
而我考试的时候是对生产数量进行计数，而且只想到了对一个工人进行限制，也不知道这种方式行不行

看天命吧

总结了一下考试的经验：
大学的考试从道理上来讲不算考试，而是叫猜题划重点。
从大一走来，从不理解为什么那么看重划重点确定哪些不考一步步过来，越来越觉得大学的考试很多时候在于你对信息的掌握，虽然很多东西懂了，但是它不考你很难受，很多东西你不懂但是偏偏要考

对于自己的能够掌握到的复习资料，一定要好好地利用。

暂时想到这么多
