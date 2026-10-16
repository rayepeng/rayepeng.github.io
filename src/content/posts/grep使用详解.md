---
title: 'grep使用详解'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
#### grep的来历
global search regular expression and print out the line
全面搜索正则表达式， 并把行打印出来
还有几个 egrep 和 fgrep 命令类似

#### 命令使用

##### 基本搜索， 显示行号， 高亮显示
> grep root /etc/passwd

在/etc/passwd中搜索root， 并打印出来
实现的方式可以用pipeline
> cat /etc/passwd | grep root

如果要显示行号， 加入 -n 选项

> grep -n root /etc/passwd

加上 --color=auto 将关键字部分使用颜色显示

##### 反向搜索
加入 -v 选项

> grep -v root /etc/passwd
grep -v root /etc/passwd | grep  -v nologin

使用dmesg列出核心信息， 再以grep找出内含有'eth'的那一行， 并显示关键字

dmesg | grep -n --color=auto 'eth'

---
2月25号更新

#### grep的基本用法

grep name(有无引号均可)

#### 反向选择 -v

#### 在文件中搜索

两种方式

##### cat 结合管道

` cat /etc/passwd | grep root

##### grep后面接文件名

` grep root /etc/passwd `

#### 文件搜索中的结果优化

##### -n
显示第几行

##### -c
简单提示到底搜索到了多少行

#### 找不到？

##### -i
不区分大小写

##### -A
after 
-A 1
即还要匹配搜索到的下一行

##### -B
before 
-B 1
即还要匹配到搜索到的前一行

#### 正则表达式的运用

最好用引号引起来

#### 找到了不想要的东西？

##### -w
只找词语
