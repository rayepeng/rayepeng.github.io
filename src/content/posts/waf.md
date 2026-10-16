---
title: 'waf'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
题目名字是waf

![](https://upload-images.jianshu.io/upload_images/10651191-3421962c3eb8646e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

常规操作

![](https://upload-images.jianshu.io/upload_images/10651191-0bab49090885d70f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-05d068d062baaae1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是当你尝试输入的 `../`的时候会提示你输入id

![](https://upload-images.jianshu.io/upload_images/10651191-fb354f53adc09531.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

burp爆破尝试

![](https://upload-images.jianshu.io/upload_images/10651191-543ecd639a78d116.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-0958cb4abfcaaa40.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

获得了两个用户名和密码

并且看到了count

根据提示 `count > 100` 

![](https://upload-images.jianshu.io/upload_images/10651191-222610ce8f6be11d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

还有这一串不知名的数据

![](https://upload-images.jianshu.io/upload_images/10651191-2a11b303f4abe4d9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

看到注入点了

![](https://upload-images.jianshu.io/upload_images/10651191-3445dfbf1fa3ac49.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这个SQL语句emmm

![](https://upload-images.jianshu.io/upload_images/10651191-ffb1f63eba02e8a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

被无情地嘲讽了

![](https://upload-images.jianshu.io/upload_images/10651191-aeed97290396868c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

like字符似乎没有被过滤

![](https://upload-images.jianshu.io/upload_images/10651191-512840f150273333.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

不是很清楚# 和--+有没有被过滤

![](https://upload-images.jianshu.io/upload_images/10651191-f08e029b8729f7f8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

终于回显出一个不一样的字符了

![](https://upload-images.jianshu.io/upload_images/10651191-c9c9ceb2cf629583.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到and没有被过滤了

看来order好像被过滤了

![](https://upload-images.jianshu.io/upload_images/10651191-303b61a44573b05e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

like被过滤了

![](https://upload-images.jianshu.io/upload_images/10651191-1616557b4385f767.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

or没有被过滤

![](https://upload-images.jianshu.io/upload_images/10651191-7e5bd8e481bb3ab5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

union被过滤了

![](https://upload-images.jianshu.io/upload_images/10651191-4328c52b2c035d15.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

\#没有被过滤

![](https://upload-images.jianshu.io/upload_images/10651191-dd34133ac2dd9e3e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

emmmm这就看不懂了

![](https://upload-images.jianshu.io/upload_images/10651191-49d15e71ea14b0cc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我的天哪这个waf似乎过滤了很多东西

![](https://upload-images.jianshu.io/upload_images/10651191-a72116135c088a83.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-5cf55c1c284dd13a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我在这里纠结的点是这个SQL语句是怎么拼接的

目前来看
1. 输入单引号肯定报错，  我测试的所有字符基本上只要加了单引号就能回显出来， 当然除了个别的`union`这种字符

![](https://upload-images.jianshu.io/upload_images/10651191-f1c479331ac73633.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-12a0694b6f38046c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这两个单引号其实是不存在的
是mysql报错的时候提示的加上去的

![](https://upload-images.jianshu.io/upload_images/10651191-4e21dcb97133e2a8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

加了转义符之后那个'就没用了
但是这个waf是没有加转义符的

![](https://upload-images.jianshu.io/upload_images/10651191-f732ac1845f3bc2f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

所以我们可以猜测查询语句了

`select * from where id = '6' limit 0,1; `

试一试
`select * from where id = '6' union select 1,2,3 # limit 0,1;`
但是union没了
很奇怪的是这种情况下为什么不报错呢

![](https://upload-images.jianshu.io/upload_images/10651191-04bceceede5c3d63.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

盲注没有成功

![](https://upload-images.jianshu.io/upload_images/10651191-3c851e8edc7095c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

昏了

![](https://upload-images.jianshu.io/upload_images/10651191-a10b0ce6c766c088.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
mysql> select * from apps where id = '1 ' and 1=1;
+----+----------+-------------------+---------+
| id | app_name | url               | country |
+----+----------+-------------------+---------+
|  1 | QQ APP   | http://im.qq.com/ | CN      |
+----+----------+-------------------+---------+
1 row in set (0.00 sec)

mysql> select * from apps where id = '1 ' and 1=0;
Empty set (0.00 sec)
```
其实and的用法是这样子的

所以我们应该这样子尝试

![](https://upload-images.jianshu.io/upload_images/10651191-be9a219b0a297dc0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

所以从这里看， and被过滤了

![](https://upload-images.jianshu.io/upload_images/10651191-df50e6a04c50308b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这个我就看不懂了

![](https://upload-images.jianshu.io/upload_images/10651191-c19f8d1945193326.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
