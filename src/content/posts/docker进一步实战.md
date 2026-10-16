---
title: 'docker进一步实战'
date: 2019-01-01
category: 'docker实战'
tags: []
lang: 'zh'
draft: true
---
#### 引子
我花了大概半天多的时间去学习了一些关于docker底层的知识，看的是华为的那本docker实战， 同样的第一遍是一头雾水， 但是之后感觉其中写到的cgroup和namespace， 还有docker最底层的东西的介绍，其实都加深了对docker的认识。在此之上，我使用了我们之前打hctf比赛的源码， 利用它提供的dockerfile成功地搭建了一个ruby on rails网站，第一次领悟到了docker的魅力， 这篇文章讲讲述我使用docker所做的事情， 不断更新中。

#### 利用docker镜像

##### tensorflow环境搭建

[基于docker搭建tensorflow环境](https://segmentfault.com/a/1190000015053704)

关于tensorflow我之后再还会继续写一个专题， 暂且按下不表。

从docker hub上pull下一个tensorflow image
之后如果想用jupyter notebook来开发， 可以参考如下命令
> docker run -it -p 8888:8888 tensorflow/tensorflow

但是我现在都还没有处理好jupyter notebook的远程访问问题(我自己起的名字)，所以还是直接用bash的好
其实shell环境下的ipython也是很不错的
> docker run -it tensorflow/tensorflow bash

##### ruby on rails web网站搭建
这里用到的是hctf的一道web题提供的[源码](https://github.com/fantasyqt/hctf2018_share)

其实步骤也挺简单的，不过毕竟是自己第一次成功地搭建了一个网站

> sudo docker build -t hctf:test .
sudo docker run -dt -p 2000:3000  hctf:test bash

然后需要运行一个 ./run.sh

---
补充一下docker 运行容器内命令的方法， 
1. docker exec
2. 进入bash之后再运行

[docker exec命令详解](http://www.runoob.com/docker/docker-exec-command.html)

在docker中以交互模式运行一个容器内的sh脚本命令如下：
> docker exec -it containerID /bin/sh    sh脚本的文件路径

或者开启一个bash
> docker exec -it containerID /bin/bash
