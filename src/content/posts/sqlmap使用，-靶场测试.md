---
title: 'sqlmap使用，-靶场测试'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
# 参考
[sqlmap使用教程](https://www.jianshu.com/p/65d7522ecc1f)
[sqlmap使用手册](https://www.jianshu.com/p/4fb15a2c9040)

# 之前的一篇文章 小白的SQL注入中， 我用了一些常规的手法，
1. 检测是否有注入
2. 爆表的字段数
3. 利用表的字段数目爆数据库和所有的表
4. 然后利用union查询flag表的信息

其实这些过程是可以利用一个自动化注入工具来完成的

sqlmap
## 检查注入点
使用-u参数，  -u URL

## 爆所有数据库信息
-dbs 

## 爆当前数据库信息
--current-dbs

## 指定数据库的名字列出所有的表
-D 数据库名 --tables

## 指定数据库的表列出所有的字段
-D 数据库名 -T 表名 --columns

## 指定数据库名， 表名字段 dump出指定字段

-D 数据库名 -T 表名 -C 字段名 --dump

# BWVS靶场
这个靶场是我曾经费了好大功夫搭建的，为此弄懂了sql和php还有apache的关系

现在是时候发挥用场了

手工注入的一些常见手法
## 基于union的注入
一般必须有显示位， 也就是数据库查询结果之后返回的信息是显示在当前页面的哪几个位置上

常用的
--+  # 注释符

and version() > 0   --+ 判断数据库类型

and length(user()) > 0--+

猜解列数
order by 3 --+   这个需要不断地尝试了

知道列数之后就方便了union注入

先记到这 [联合查询注入](https://www.jianshu.com/p/399881e79b1f)

# 基于报错的注入

我才知道mysql有这种特性， 这些函数必须用select来进行调用。。

![](https://upload-images.jianshu.io/upload_images/10651191-152cfc741b1472bc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这个数据库好好玩。。

![](https://upload-images.jianshu.io/upload_images/10651191-69594308b02b5e57.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

原来这些函数可以这样测试， 涨姿势了

![](https://upload-images.jianshu.io/upload_images/10651191-1c03047afe0e996c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-0c83c1ad4fecdae3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

原来可以通过这种方式去爆出表名和数据库名

![](https://upload-images.jianshu.io/upload_images/10651191-f92f28f70be36b44.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 靶场演示

![](https://upload-images.jianshu.io/upload_images/10651191-29adae82c5b3623b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-3c3552f9b056c1af.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-d1a7f8596ab61c8a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-0ff7fa150f764dfd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-ce014932e3ceb257.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

基本上数据库的信息就都暴露出来了

[字符型SQL注入](https://www.cnblogs.com/zaki-Gui/p/5719920.html)

中级的题目修改成用 post方式了

![](https://upload-images.jianshu.io/upload_images/10651191-f33b1647021e0fe3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[DVWA](http://blog.itpub.net/31554484/viewspace-2216132/)

# 上海那个比赛的另一道SQL注入题目

1 的base64编码为 QM==

过滤了or and select union 关键字
去除了单引号，双引号，空格等字符

可以双写绕过关键字的过滤
