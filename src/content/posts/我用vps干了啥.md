---
title: '我用vps干了啥'
date: 2019-01-01
category: '心路历程'
tags: []
lang: 'zh'
draft: true
---
在vultur上购买了一个vps， 之前在新加坡的经常出现断线的问题， 于是换成了加拿大的服务器。

至于怎么购买vps， 搭建vpn什么的就不说了

# 安装docker并搭建ctf比赛环境

首先是要安装docker&docker-compose

之后去GitHub上clone一个项目

如果有`docker-compose.yml`文件的的话直接输入`docker-compose up`就完成了

以一道`md5-vs-injection`的题目为例
我们看一下它的目录结构：

![](https://upload-images.jianshu.io/upload_images/10651191-01906fb79c8025fe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这是`docker-compose.yml`文件
```
version: '2'

services:
  mysql:
    image: mysql:5.6
    restart: always
    volumes:
      - ./database.sql:/docker-entrypoint-initdb.d/database.sql
      - ./db-volume:/var/lib/mysql
      - ./mysqld.cnf:/etc/mysql/mysql.conf.d/mysqld.cnf
    environment:
      - MYSQL_DATABASE=ctf
      - MYSQL_ROOT_PASSWORD=root
  web:
    build: .
    depends_on:
      - mysql
    ports:
      - '10010:80'
    volumes:
      - ./source:/var/www/html
      - ./logs:/var/log/apache2
    stdin_open: true

```
具体的细节之后再去研究
只需要输入`docker-compose up`就能完成镜像的构建

之所以用vps而不是自己用虚拟机玩。 还是国外的docker镜像构建的快一些23333

然后你就可以看到题目了

![](https://upload-images.jianshu.io/upload_images/10651191-5642907385d44b2b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

后台是这样子的
感觉超棒！
![](https://upload-images.jianshu.io/upload_images/10651191-edfed709c06463e6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

毕竟服务器还是太垃圾了， 不过体验还行

# 安装lamp

[https://github.com/teddysun/lamp](https://github.com/teddysun/lamp)
有详细的教程， 按着步骤操作就行了

```
apt-get -y install wget screen git
git clone https://github.com/teddysun/lamp.git
cd lamp
chmod 755 *.sh
screen -S lamp
./lamp.sh
```

经过了很多次选择就行了

把数据库密码备忘一下
![](https://upload-images.jianshu.io/upload_images/10651191-d49e611df62584d0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果可行的话， 我估计还想自己搭建一个wordpress的blog
