---
title: 'MySQL知识积累'
date: 2019-01-01
category: '代码审计'
tags: []
lang: 'zh'
draft: true
---
一直不太会SQL注入， 借着bugkuctf后面的几道题目来巩固一下

# login3

[login3](http://119.23.249.120/archives/286)

## databse()
会返回一个字符串 代表当前(默认的)数据库的名字

## MID()
用于从文本中提取字符串

## substring()
用法和mid类似

如果我们在where语句之后加入一个and语句
如下：

> where username=’admin’ and (substring(database(),1,1)=’a’)

就能够判断书数据库的第一位是a了

但是题目过滤了and！
经过尝试发现还过滤了空格，逗号，等号，for

所以迫不得已采用了异或运算

# sql2
这个题目提示全部都被过滤了。
and
