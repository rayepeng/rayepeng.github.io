---
title: 'python的痛苦'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
# list

list的常用方法
append()在后面追加一个元素
insert()指定位置插入一个元素
extend()扩展

append()方法可以插入list
但是extend不行
clear()清空list的所有内容
index()方法返回元素第一次出现的位置，必须指定一个元素
count()查一个元素出现了多少次， 指定一个元素

index查找的时候尽量使用try 

![](https://upload-images.jianshu.io/upload_images/10651191-6b0eaa6c06ae5c4e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

list是可以允许重复元素的

![](https://upload-images.jianshu.io/upload_images/10651191-64c71dec7972506a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

count()只会数变量对应的值有多少个

sort ()用来排序， 加入reverse=True是倒过来排序。
排序之前必须保证每个元素互相之间都是可以比较的，或者重载运算符

reverse()颠倒元素

copy()拷贝， 是真正的拷贝， 不是引用的拷贝

列表生成式
list = [i for i in range(10)]

生成一大段的点

![](https://upload-images.jianshu.io/upload_images/10651191-075e826b6e8d28a4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

还可以在其中加入判断

list = [x for x in range(10) if x >0]

![](https://upload-images.jianshu.io/upload_images/10651191-9d7681fefc1813a7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

生成100以内的所有勾股数

ls=[(x,y,z) for x in range(100) for y in range(100) for z in range(100) if x**2 + y**2 == z**2 and x > 0 and y>0]

记得python中的且运算符是 and or not

![](https://upload-images.jianshu.io/upload_images/10651191-b0b48a08127cd614.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# requests 库

 ```
import requests
s = requests.get("URL")
s.text
```
三行代码抓取一个网页

# 正则表达式再介绍

找到一个单词， 前后都是空格

模糊匹配
这个正则表达式成功地实现了匹配

![](https://upload-images.jianshu.io/upload_images/10651191-349f42fdecf71ebe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这是选自秋名山老司机题目的re
![](https://upload-images.jianshu.io/upload_images/10651191-72df9b2ffd3a7615.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 文件操作
