---
title: 'pwn从入门到如土'
date: 2019-01-01
category: 'pwn相关'
tags: []
lang: 'zh'
draft: true
---
常用的工具
pwntools
pwndbg
peda

# 4月6日 熟悉了堆的相关数据结构

先整理一下我今天学到的吧
1. chunk
这个是分配了的内存块吧， 每个chunk由下图对应的数据结构组成

如果是已经分配了的， 那么fd和bk这两个字段就没用了

![数据结构](https://upload-images.jianshu.io/upload_images/10651191-18d46c2e13a600f1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

并且prev_size指向了前一块chunk(必须是free了的)， 而当前的chunk， 如果不够用就会占用下一块chunk的prev_size

所以我是不是可以理解成chunk是一块分配了的， 一块free了的(这个理解有问题)

我们可以从这个实例代码中看出来

```
int main(void)
{
    void *chunk1,*chunk2,*chunk3;
    chunk1=malloc(0x30);
    chunk2=malloc(0x30);
    chunk3=malloc(0x30);
    //进行释放
    free(chunk1);
    free(chunk2);
    free(chunk3);
    return 0;
}

```

先申请了内存 然后再释放掉

我们看下释放前的(虽然我不知道这个是怎么看到的)
> 0x602000:   0x0000000000000000  0x0000000000000041 <=== chunk1
0x602010:   0x0000000000000000  0x0000000000000000
0x602020:   0x0000000000000000  0x0000000000000000
0x602030:   0x0000000000000000  0x0000000000000000
0x602040:   0x0000000000000000  0x0000000000000041 <=== chunk2
0x602050:   0x0000000000000000  0x0000000000000000
0x602060:   0x0000000000000000  0x0000000000000000
0x602070:   0x0000000000000000  0x0000000000000000
0x602080:   0x0000000000000000  0x0000000000000041 <=== chunk3
0x602090:   0x0000000000000000  0x0000000000000000
0x6020a0:   0x0000000000000000  0x0000000000000000
0x6020b0:   0x0000000000000000  0x0000000000000000
0x6020c0:   0x0000000000000000  0x0000000000020f41 <=== top chunk

我们看到每个chunk， 箭头所指向的是041， 最后一位1是说明in use
这个时候堆中并没有填数据

执行三次free释放掉之后

> 0x602000:   0x0000000000000000  0x0000000000000041 <=== chunk1
0x602010:   0x0000000000000000  0x0000000000000000
0x602020:   0x0000000000000000  0x0000000000000000
0x602030:   0x0000000000000000  0x0000000000000000
0x602040:   0x0000000000000000  0x0000000000000041 <=== chunk2
0x602050:   0x0000000000602000  0x0000000000000000
0x602060:   0x0000000000000000  0x0000000000000000
0x602070:   0x0000000000000000  0x0000000000000000
0x602080:   0x0000000000000000  0x0000000000000041 <=== chunk3
0x602090:   0x0000000000602040  0x0000000000000000
0x6020a0:   0x0000000000000000  0x0000000000000000
0x6020b0:   0x0000000000000000  0x0000000000000000
0x6020c0:   0x0000000000000000  0x0000000000020f41 <=== top chunk

可以看到此时3->2->1已经构成了链表

也就是此时位于 main_arena 中的 fastbin 链表中已经储存了指向 chunk3 的指针，并且 chunk 3、2、1 构成了一个单链表

亲身体会一下

代码复用了上面的

哇哇哇好激动我终于看到堆了！！！

![](https://upload-images.jianshu.io/upload_images/10651191-0439aecea302157e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> gdb查看内存单元的命令 x/200gx  0x08402000

(其实很多pwn新手之所以很难入门， 就是因为大佬们不愿意把这些命令截图出来， 因为觉得太简单了吧）

嗯，我是从这里找到堆的起始地址的

![](https://upload-images.jianshu.io/upload_images/10651191-ca6bb976486e204c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

原来也可以vmmap直接查看heap， 不用自己去找了
![](https://upload-images.jianshu.io/upload_images/10651191-706219746b83bae9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

三次释放操作之后， 现在堆的内存映射如下：

![](https://upload-images.jianshu.io/upload_images/10651191-b47c142126568539.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

哇太兴奋了
终于看到它们了

![](https://upload-images.jianshu.io/upload_images/10651191-3f9382782f013978.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 接下来是double free

实例代码如下

```
int main(void)
{
    void *chunk1,*chunk2,*chunk3;
    chunk1=malloc(0x10);
    chunk2=malloc(0x10);

    free(chunk1);
    free(chunk1);
    return 0;
}
```

本来执行应该报错的，但是我这里很诡异啊

我们看到那个指针指向了自己！！
![](https://upload-images.jianshu.io/upload_images/10651191-c1652b85d089af88.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 关于double free

第一次malloc

![image.png](https://upload-images.jianshu.io/upload_images/10651191-0cceeb054e46f67f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

第二次malloc
![image.png](https://upload-images.jianshu.io/upload_images/10651191-4f665217319321de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

连续两次释放之后

![](https://upload-images.jianshu.io/upload_images/10651191-677c7b32ba53f7b9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

再释放一次

![](https://upload-images.jianshu.io/upload_images/10651191-859fc22217517b02.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

执行完下列语句之后

```
 chunk_a=malloc(0x10);
*(long long *)chunk_a=&bss_chunk;
```

![](https://upload-images.jianshu.io/upload_images/10651191-95deb3a7ac9b2b7a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
看一下所指的内容

其实这个时候就已经被修改了

![](https://upload-images.jianshu.io/upload_images/10651191-2708d01a628fc1ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

修改了指针

![](https://upload-images.jianshu.io/upload_images/10651191-4dcf0da46d6af315.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

此时看到修改的指针指向了一片新的内存

![](https://upload-images.jianshu.io/upload_images/10651191-2dff872153d7ff36.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

查看堆的信息如下：

![](https://upload-images.jianshu.io/upload_images/10651191-d860cda72aec7d20.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
