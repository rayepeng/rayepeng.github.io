---
title: '复习git'
date: 2019-08-16
updated: 2019-08-20
category: 'note'
tags:
  - 'git'
lang: 'zh'
draft: false
---
最近发现自己还不是很懂git，于是好好学习一下

## git标签管理

git有一个打标签的功能，这个功能可以理解成虚拟机的快照，

> Git的标签虽然是版本库的快照，但其实它就是指向某个commit的指针（跟分支很像对不对？但是分支可以移动，标签不能移动），所以，创建和删除标签都是瞬间完成的。 —-摘自廖雪峰

-   命令git tag 用于新建一个标签，默认为HEAD，也可以指定一个commit id；
    
-   命令git tag -a \-m “blablabla…”可以指定标签信息；
    
-   命令git tag可以查看所有标签。
    
-   命令git push origin 可以推送一个本地标签；
    
-   命令git push origin —tags可以推送全部未推送过的本地标签；
    
-   命令git tag -d 可以删除一个本地标签；
    
-   命令git push origin :refs/tags/可以删除一个远程标签。
    

## GitHack的原理

如果将.git文件夹部署到线上环境，将引起git源码泄露

工作原理：

1、解析.git/index文件，找到工程中所有的： ( 文件名，文件sha1 )  
2、去.git/objects/ 文件夹下下载对应的文件  
3、zlib解压文件，按原始的目录结构写入源代码

## git的原理

git cat-file 命令

![git cat-file](https://i.loli.net/2019/08/16/ALhQ2poTiesaFZz.png)

## 参考

[GitHack：一个git泄露利用脚本](https://www.freebuf.com/sectool/66096.html)  
[git内部原理](https://www.bbsmax.com/A/o75NM9mKJW/)  
[XDCTF2015代码审计全解](https://www.leavesongs.com/PENETRATION/XDCTF-2015-WEB2-WRITEUP.html)
