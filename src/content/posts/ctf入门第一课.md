---
title: 'ctf入门第一课'
date: 2019-09-26
updated: 2019-10-10
category: 'ctf'
tags:
  - '学习'
  - 'sqlmap'
lang: 'zh'
draft: false
---
## ctf入坑

[ctfwiki](https://ctf-wiki.github.io/ctf-wiki/)是一个很好的入门资源

[适合新手的CTF靶场合集](https://blog.csdn.net/weixin_41177699/article/details/89467911)

最经典的靶场[bugkuctf](https://ctf.bugku.com)

## 如何学习

学会做笔记——使用markdown快速整理你的思路

论博客的重要性——Github pages or Wordpress or 各大博客平台(简书，csdn，博客园，掘金等等)

学会分享——分享自己所学到的知识

学会使用python

## 如何提问

[提问的艺术](https://blog.csdn.net/danky/article/details/1370632)

## Web安全

Web安全主要包含——SQL注入，XSS跨站，SSRF，各种web框架的审计等

### SQL注入

[sqlmap](https://github.com/sqlmapproject/sqlmap)

[SQL教程](https://www.runoob.com/sql/sql-tutorial.html)

前端与后台是如何交互的

输入1返回的值

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/dvwa.png)

后台的代码：

```php
<?php
if( isset( $_REQUEST[ 'Submit' ] ) ) {
	// Get input
	$id = $_REQUEST[ 'id' ];
	// Check database
	$query  = "SELECT first_name, last_name FROM users WHERE user_id = '$id';";
	$result = mysqli_query($GLOBALS["___mysqli_ston"],  $query ) or die( '<pre>' . ((is_object($GLOBALS["___mysqli_ston"])) ? mysqli_error($GLOBALS["___mysqli_ston"]) : (($___mysqli_res = mysqli_connect_error()) ? $___mysqli_res : false)) . '</pre>' );
?>
```

重点关注：

`"SELECT first_name, last_name FROM users WHERE user_id = '$id';"`

`where`语句的用法

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/dvwa.png)

详情参考[DVWA学习](/posts/dvwa%E5%AD%A6%E4%B9%A0/)

栗子[sql注入实践](/posts/sql%E6%B3%A8%E5%85%A5%E5%AE%9E%E8%B7%B5/)

墨者的一道[题目](http://219.153.49.228:47452/new_list.php?id=1)

看到新闻页面  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/sql8.png)

直接上`sqlmap`

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/sql10.png)

爆表  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/sql9.png)

指定数据库爆表

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/sql11.png)

指定表爆字段

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/sql12.png)

将表全部dump出来

突然出问题了。。

### XSS跨站

[参考ctfwiki](https://ctf-wiki.github.io/ctf-wiki/web/xss-zh/#self-xss)

具体细节之后说
