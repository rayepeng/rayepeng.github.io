---
title: '黑客攻防技术宝典-web实战篇-阅读笔记'
date: 2019-01-01
category: '代码审计'
tags: []
lang: 'zh'
draft: true
---
计算机网络这方面的内容确实有些难受， 东西很多， 但是好多东西， 比如七层协议模型， 已经看了不下数十遍了， 却依旧不是特别了解。 不管怎么说， 计算机网络是一个值得长期钻研的内容。

# HTTP协议
一种不需要事先建立连接的通信传输协议。

## HTTP请求

典型的请求格式如下：
![典型请求格式](http://upload-images.jianshu.io/upload_images/10651191-35ea884b3a593daf.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 请求方式
虽然请求方法有很多种， 但是最常见的只有两种， GET和POST
实际上提交表单的时候 method 也是这两个。

请求方法之后紧跟着URL， 结尾是协议名称及版本号。

### 报文头
由一些列格式为： 属性名:属性值
服务端据此获得客户端的信息

常见的报文头属性
#### Accept
请求报文可通过一个“Accept”报文头属性告诉服务端 客户端接受什么类型的响应。 

#### Cookie
客户端的Cookie就是通过这个报文头属性传给服务端的

#### Referer 
表示这个请求是从哪个URL过来的，假如你通过google搜索出一个商家的广告页面，你对这个广告页面感兴趣，鼠标一点发送一个请求报文到商家的网站，这个请求报文的Referer报文头属性值就是http://www.google.com。 

#### Cache-Control 
对缓存进行控制，如一个请求希望响应返回的内容在客户端要被缓存一年，或不希望被缓存就可以通过这个报文头达到目的。 

如以下设置，相当于让服务端将对应请求返回的响应内容不要在客户端缓存： 

> Cache-Control: no-cache  

### 报文体
它将一个页面表单中的组件值通过param1=value1&param2=value2的键值对形式编码成一个格式化串，它承载多个请求参数的数据。不但报文体可以传递请求参数，请求URL也可以通过类似于“/chapter15/user.html? param1=value1&param2=value2”的方式传递请求参数。

### 实际传递的报文格式如下：
![报文格式](http://upload-images.jianshu.io/upload_images/10651191-58c1c250c34fdf0d.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## HTTP响应

典型的响应报文
![响应报文](http://upload-images.jianshu.io/upload_images/10651191-ef4e4f21409bb685.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 报文协议及其版本

### 状态码及其状态描述
#### 响应状态码
* 1xx 消息，一般是告诉客户端，请求已经收到了，正在处理，别急...
* 2xx 处理成功，一般表示：请求收悉、我明白你要的、请求已受理、已经处理完成等信息.
* 3xx 重定向到其它地方。它让客户端再发起一个请求以完成整个处理。
* 4xx 处理发生错误，责任在客户端，如客户端的请求一个不存在的资源，客户端未被授权，禁止访问等。
* 5xx 处理发生错误，责任在服务端，如服务端抛出异常，路由出错，HTTP版本不支持等。

### 响应报文头

#### Cache-Control 

响应输出到客户端后，服务端通过该报文头属告诉客户端如何控制响应内容的缓存
比如设置让客户端对响应内容缓存3600秒，也即在3600秒内，如果客户再次访问该资源，直接从客户端的缓存中返回内容给客户，不要再从服务端获取（当然，这个功能是靠客户端实现的，服务端只是通过这个属性提示客户端“应该这么做”，做不做，还是决定于客户端，如果是自己宣称支持HTTP的客户端，则就应该这样实现）

#### ETag 
一个代表响应服务端资源（如页面）版本的报文头属性，如果某个服务端资源发生变化了，这个ETag就会相应发生变化。它是Cache-Control的有益补充，可以让客户端“更智能”地处理什么时候要从服务端取资源，什么时候可以直接从缓存中返回响应。 

### 响应报文体

# 编码方案

## URL编码
URL只允许使用US-ASCII字符集中的可打印字符（也就是ASCII代码在0x20 ~ 0x7e范围内的字符）。而且，由 于其在URL方案或HTTP协议内具有特殊含义，这个范围内的一些字符也不能用在URL中。 

常见的URL编码
* %3d =
* %25 %
* %20 space
* %0a /n
* %00 空字节
另一个值得注意的编码字符是加号（+），它代表URL编码的空格（除%20代表空格外）。

## Unicode编码
16位Unicode编码的工作原理与URL编码类似。为通过HTTP进行传输，16位Unicode编码的字符以%u为前缀， 其后是这个字符的十六进制Unicode码点。例如：
 %u2215代表/； 
%u00e9代表é。

## HTML编码

## Base64编码

## 十六进制编码

#参考资料
[HTTP请求行， 请求头， 请求体详解](https://blog.csdn.net/u010256388/article/details/68491509/)
[List of HTTP status codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)
[List of HTTP header fields](https://en.wikipedia.org/wiki/List_of_HTTP_header_fields)
