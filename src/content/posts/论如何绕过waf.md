---
title: '论如何绕过waf'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
\# 号不行 就用 --+
注意结合mysql控制台使用

> http://challenge.whuctf.com:8019/?id=3' and 1 =1;--+

这个时候union被过滤了

![](https://upload-images.jianshu.io/upload_images/10651191-be0f762a61ab2e8c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以确定是6个字段

![](https://upload-images.jianshu.io/upload_images/10651191-396a96fb98a06757.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

问题是union被过滤了

是时候开始盲注了

![](https://upload-images.jianshu.io/upload_images/10651191-fd62b284f45e766d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

应该可以异或注入

python脚本直接爆数据库
![](https://upload-images.jianshu.io/upload_images/10651191-da20cea6f3306b55.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

得到数据库名字为 test

接下来开始爆表

其实暴库也不用那么复杂

![](https://upload-images.jianshu.io/upload_images/10651191-f59597946bcf9f16.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

论mysql括号的重要性

![](https://upload-images.jianshu.io/upload_images/10651191-d6edb202875633a5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我好像差点忘了count这个东东

![](https://upload-images.jianshu.io/upload_images/10651191-d603a870160c8fa8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

利用报错
直接爆出库和表

![](https://upload-images.jianshu.io/upload_images/10651191-0b639460f0fd125b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

payload 如下：
> http://challenge.whuctf.com:8019/?id=3'and linestring(id) --+

猜测出存在一个字段叫做 name

![](https://upload-images.jianshu.io/upload_images/10651191-1d5d5f5e8bb141a2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

利用updatexml进行报错注入

![](https://upload-images.jianshu.io/upload_images/10651191-fb9b93da3f06743a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-b718ff63be1a04da.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-4b80ceba10dddf80.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> http://challenge.whuctf.com:8019/?id=1'^updatexml(1,concat(0x7e,(select%a0database())),1)^'0--+

可以看到from确实就是被过滤了

![](https://upload-images.jianshu.io/upload_images/10651191-848274d52877bd98.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-66761c1c019ff3bd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是from被过滤了就很烦
受不了了。。

# count(*) 了解一下?

![](https://upload-images.jianshu.io/upload_images/10651191-be5b170c9c8578f4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

COUNT(DISTINCT 字段)，返回不同的非NULL值数目；若找不到匹配的项，则COUNT(DISTINCT)返回 0 。
