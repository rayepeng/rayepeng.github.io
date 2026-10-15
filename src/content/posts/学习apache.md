---
title: '学习apache'
date: 2019-08-20
updated: 2019-09-16
category: 'note'
tags:
  - 'apache'
lang: 'zh'
draft: false
---
一直以来习惯了在Windows下通过wampserver和phpstudy来进行php,apache,mysql的组合，现在有必要自己从头开始进行一些学习了

## apache配置学习

## .htaccess文件

先看一段防盗链的代码：

```
RewriteBase /

RewriteCond %{HTTP_REFERER} !^$

RewriteCond %{HTTP_REFERER} !^http://(www.)?aqee.net/.*$ [NC]

RewriteRule .(gif|jpg|swf|flv|png)$ /feed/ [R=302,L]
```

肯定是一脸茫然

那就好好学习一下.htaccess文件

## 服务器状态码

在服务器回应客户端时会回应相应的状态码，不同的状态码具有不同的含义

1xx：信息类

2xx：成功类

3xx：重定向类

4xx：客户端错误类

5xx：服务端错误类

（比如我用flask写一个小型的应用时，遇到了500的错误其实是代码出错了:cry:

## 参考

[由浅入深学习apache](https://blog.51cto.com/jackcui/1858989)
