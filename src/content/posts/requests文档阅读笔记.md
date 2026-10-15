---
title: 'requests文档阅读笔记'
date: 2020-03-10
category: '编程'
tags:
  - '文档'
lang: 'zh'
draft: false
---
## 如何发送post请求

```
r = requests.post('http://httpbin.org/post', data = {'key':'value'})
```

其他的请求也类似

```
>>> r = requests.put('http://httpbin.org/put', data = {'key':'value'})
>>> r = requests.delete('http://httpbin.org/delete')
>>> r = requests.head('http://httpbin.org/get')
>>> r = requests.options('http://httpbin.org/get')
```

## GET请求如何传递URL参数

```
In [12]: r = requests.get(url,params={"key1":"1", "key2":"2"})

In [13]: r.url
Out[13]: 'http://httpbin.org/get?key2=2&key1=1'
```

但是怎么传递数组呢？这是个问题
