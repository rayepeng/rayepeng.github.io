---
title: 'ctf题目复盘'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
> 为了准备四月下旬的校赛， 豁出去了

# 2048

首先进去之后是这样一个界面

2048是我喜欢的一个游戏，

然后我女朋友把它玩到了2048， 却啥也没出现。。

![](https://upload-images.jianshu.io/upload_images/10651191-8be48eb5c461bec5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

网站做的很流畅， 但是我一点思路都没有

开始抓包

![GTE请求](https://upload-images.jianshu.io/upload_images/10651191-9a17c4e6f1124149.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

发现了一个ETag的东西， 怎么把其下载下来呢？
![response响应](https://upload-images.jianshu.io/upload_images/10651191-28b93f00e0d72208.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

怎么把它下载下来呢？
![...](https://upload-images.jianshu.io/upload_images/10651191-799205adc4e57bf9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

扫描后台也没有发现什么， 重点应该就是放在这个压缩包了

[初识HTTP缓存](https://www.jianshu.com/p/3e2afe089e11)

Etag 是URL的Entity Tag，用于标示URL对象是否改变，区分不同语言和Session等等。具体内部含义是使服务器控制的，就像Cookie那样。

HTTP协议规格说明定义ETag为“被请求变量的实体值” 。另一种说法是，ETag是一个可以与Web资源关联的记号（token）

既然是一个资源实体，那应该怎么下载下来呢

> 想必许多网友都有订阅某些大虾的RSS的习惯吧，但是大虾也是人，也要吃饭睡觉打豆豆，所以不可能无时无刻的在从事文学创作，因此一般产量较高的大虾也许平均每天能更新两篇已经是不错了，但是网友们却总是不断的去刷新RSS订阅的内容，期望在下次刷新中又有新的劲爆文章出现，如果我们每次刷新，都要从服务器端重新获取内容（事实上，几乎一天内95%以上的刷新返回的都是相同内容，因为刚才也说了，大虾一般一天也就出一两篇新文章而已，所以大部分时间内，内容都是相同的），如果订阅量相当巨大，这对于服务器的压力还是带宽都是一个严重的挑战。其实真正需要服务器重新返回内容是大虾们更新了新的文章后，而其他时间我们无论怎么刷新服务器最好能做到不需返回任何数据，这才是一个比较好的方案，而我们的主角etag响应头的出现正是为了解决这个问题。

我们来看下图
服务器端返回了最新的内容

![1](https://upload-images.jianshu.io/upload_images/10651191-7d48db603c73ea9c.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后我们尝试刷新，以希望能获得最新的内容，

但是服务器端并不上当

![2](https://upload-images.jianshu.io/upload_images/10651191-052d661287382efb.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果某大虾并没在这段时间内发表任何文章，于是webserver端的rss文件没有任何变化，于是If-None-Match值和server端的etag值相比较完全相等， 就会发送304响应码

![3](https://upload-images.jianshu.io/upload_images/10651191-8a8de8e8171e21d3.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
如果某大虾刚发表了一篇新的文章，因此在webserver中的rss的内容发生了改变，因此他的etag值就会发生改变，于是服务器会拿http请求中的If-None-Match的

值和改变和的etag值做对比，显然不正确的，于是webserver就会发送一个新的rss内容给客户端，这里我不能强制要求某大虾来配合我们的实验去立马发表新文章，

所以我们就变相做，也就是我们故意修改http请求头中的If-None-Match的值，这样就和服务器端的etag就不会匹配了，显然这时候服务器就会受骗发送一份“新”的回来

![4](https://upload-images.jianshu.io/upload_images/10651191-1acd1ebd05d49c37.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[Etag精解]([https://www.cnblogs.com/kabi/p/6288700.html](https://www.cnblogs.com/kabi/p/6288700.html)
)

然而我并不知道下一步该怎么办

![](https://upload-images.jianshu.io/upload_images/10651191-966d93ce9585ad76.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[https://www.jianshu.com/p/e9923b65789e](https://www.jianshu.com/p/e9923b65789e)

![](https://upload-images.jianshu.io/upload_images/10651191-8efdc558e08e59f8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

修改了之后感觉没啥用

每次返回给我的ETag值都不一样。。

我很懵。

看WP了。 发现居然是.git源码泄露。

首先是怎么知道是.git源码泄露的呢？

![](https://upload-images.jianshu.io/upload_images/10651191-1b5e4c1369a878c2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

直接用工具下载好了。。

![](https://upload-images.jianshu.io/upload_images/10651191-b701377dc13c4613.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

进入目录之后，使用git log可以看到每次提交就下来的东东

![](https://upload-images.jianshu.io/upload_images/10651191-337ff501afa66c30.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

更确切的做法应该是 git reflog

![](https://upload-images.jianshu.io/upload_images/10651191-47aab7e2f0745051.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后就是git 的版本回退啦
git reset --hard 3465ee

然后。。 flag就出来了

![image.png](https://upload-images.jianshu.io/upload_images/10651191-6eea643e8ab5e5f7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

参考
[https://blog.csdn.net/qq_35078631/article/details/77777416](https://blog.csdn.net/qq_35078631/article/details/77777416)

[https://www.jianshu.com/p/e9923b65789e](https://www.jianshu.com/p/e9923b65789e)

# 2018-suctf-homework

进去之后是一个很漂亮的网页

![](https://upload-images.jianshu.io/upload_images/10651191-3349c6af5b424e65.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

看到一串代码， 估计就是代码审计了

```
<?php 
class calc{
	function __construct__(){
		calc();
	}

	function calc($args1,$method,$args2){
		$args1=intval($args1);
		$args2=intval($args2);
		switch ($method) {
			case 'a':
				$method="+";
				break;

			case 'b':
				$method="-";
				break;

			case 'c':
				$method="*";
				break;

			case 'd':
				$method="/";
				break;
			
			default:
				die("invalid input");
		}
		$Expression=$args1.$method.$args2;
		eval("\$r=$Expression;");
		die("Calculation results:".$r);
	}
}
```

# 孙xx的博客

一个很漂亮的wordpress网站

![nikto扫描一下](https://upload-images.jianshu.io/upload_images/10651191-407a90824319271f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

御剑感觉扫出了很多东西

![](https://upload-images.jianshu.io/upload_images/10651191-1182a9cb39de34ef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-93664446f9a3b1a0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-1b8b036d9076e932.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

看来用户名就是sun
![image.png](https://upload-images.jianshu.io/upload_images/10651191-f6238374357020d2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

看了好多wp都说是找到了phpmyadmin。。

算了我找不到

# 参考
又找到一个很好的工具
[专为ctf而生的扫描工具](https://xz.aliyun.com/t/2558)

好想自己写一个扫描工具啊
