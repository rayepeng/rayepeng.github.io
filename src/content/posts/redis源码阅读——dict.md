---
title: 'redis源码阅读——dict'
date: 2019-07-30
updated: 2019-07-31
category: 'note'
tags:
  - 'C'
  - 'redis'
  - 'dict'
lang: 'zh'
draft: false
---
## dict类型

先看宏定义

最基本的是dict类型，如下：

```
typedef struct dict {
    dictType *type;
    void *privdata;
    dictht ht[2];
    PORT_LONG rehashidx; /* rehashing not in progress if rehashidx == -1 */
    int iterators; /* number of iterators currently running */
} dict;
```

-   dictType 是一个结构体，包含了dict的一些基础方法
-   privdata 是私有数据
-   dictht 是哈希表
-   rehashidx 代表是否在进行重哈希，如果不为-1则代表正在进行重哈希
-   iterators 代表迭代器，暂时还不太理解

接下来看哈希表的结构(dictht):

```
typedef struct dictht {
    dictEntry **table;
    PORT_ULONG size;
    PORT_ULONG sizemask;
    PORT_ULONG used;
} dictht;
```

-   table是一个指向`dictEntry`的二级指针
-   size代表哈希表的大小
-   sizemask 总是等于size-1
-   used代表该哈希表已有的节点数量

这是`dictht`的构造：  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/graphviz-bd3eecd927a4d8fc33b4a1c7f5957c52d67c5021.png)

不过这里为什么要二级指针呢？

> 可以这样理解，因为`dictEntry *`本身就是一个一级指针，同时`table`指向的又是一个指针数组，所以这里需要二级指针了

### 复习一下数组指针和指针数组的概念

数组指针，本质上还是指针

`int (*p)[n]`  
`()`运算优先级更高，`*`优先与p结合，p还是一个指针，不过p指向的是一个数组，这时候`p+1`运算的步长就是`n`,故这样的指针也叫行指针

指针数组  
`int *p[n]`  
`[]`优先级更高，p先与方括号结合，这时候p代表的是一个数组，这个数组中每个元素都是一个指针，故此时p就是二级指针

之后继续看`dictEntry`类型

```
typedef struct dictEntry {
    void *key;
    union {
        void *val;
        uint64_t u64;
        int64_t s64;
        double d;
    } v;
    struct dictEntry *next;
} dictEntry;
```

这里面存储了key-value键值对，其中`key`是一个`void*`类型的指针，可以代表任意类型的数据，但是`value`是一个联合体，可以在指针，整数和浮点数中取值

`next`属性是指向另一个哈希表节点的指针， 这个指针可以将多个哈希值相同的键值对连接在一次， 以此来解决键冲突（collision）的问题

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/dictentry.png)

## 参考

[字典的实现](http://redisbook.com/preview/dict/datastruct.html)  
[Redis内部数据结构详解(1)——dict](http://zhangtielei.com/posts/blog-redis-dict.html)  
[数组指针和指针数组的区别](https://www.cnblogs.com/hongcha717/archive/2010/10/24/1859780.html)
