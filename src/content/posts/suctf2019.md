---
title: 'suctf2019'
date: 2019-08-20
updated: 2019-08-21
category: 'ctf'
tags:
  - 'wp'
  - 'suctf'
lang: 'zh'
draft: false
---
## easy\_sql

应该是非预期解，输入abs(1)就有flag

不过也可以这样

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/sql6.png)

后期在线维护的时候泄露了源码

```php
<?php
    session_start();

    include_once "config.php";

    $post = array();
    $get = array();
    global $MysqlLink;

    //GetPara();
    $MysqlLink = mysqli_connect("localhost",$datauser,$datapass);
    if(!$MysqlLink){
        die("Mysql Connect Error!");
    }
    $selectDB = mysqli_select_db($MysqlLink,$dataName);
    if(!$selectDB){
        die("Choose Database Error!");
    }

    foreach ($_POST as $k=>$v){
        if(!empty($v)&&is_string($v)){
            $post[$k] = trim(addslashes($v));
        }
    }
    foreach ($_GET as $k=>$v){
        }
    }
    //die();
    ?>

<html>
<head>
</head>

<body>

<a> Give me your flag, I will tell you if the flag is right. </a>
<form action="" method="post">
<input type="text" name="query">
<input type="submit">
</form>
</body>
</html>

<?php

    if(isset($post['query'])){
        $BlackList = "prepare|flag|unhex|xml|drop|create|insert|like|regexp|outfile|readfile|where|from|union|update|delete|if|sleep|extractvalue|updatexml|or|and|&|\"";
        //var_dump(preg_match("/{$BlackList}/is",$post['query']));
        if(preg_match("/{$BlackList}/is",$post['query'])){
            //echo $post['query'];
            die("Nonono.");
        }
        if(strlen($post['query'])>40){
            die("Too long.");
        }
        $sql = "select ".$post['query']."||flag from Flag";
        mysqli_multi_query($MysqlLink,$sql);
        do{
            if($res = mysqli_store_result($MysqlLink)){
                while($row = mysqli_fetch_row($res)){
                    print_r($row);
                }
            }
        }while(@mysqli_next_result($MysqlLink));

    }

    ?>
```

看源码不太明白这个题目的用意，后来参考师傅们的wp时提到了`||`拼接

[mysql 修改sql\_mode 实现字符串管道‘||’连接](https://blog.csdn.net/lixora/article/details/60572357)

一种思路是直接使用`*,1`去拿到flag，另一种方式就是设置`sql_mode`来实现字符串的拼接

## python nginx

首页有源码

```
        @app.route('/getUrl', methods=['GET', 'POST'])
def getUrl():
    url = request.args.get("url")
    host = parse.urlparse(url).hostname
    if host == 'suctf.cc':
        return "我扌 your problem? 111"
    parts = list(urlsplit(url))
    host = parts[1]
    if host == 'suctf.cc':
        return "我扌 your problem? 222 " + host
    newhost = []
    for h in host.split('.'):
        newhost.append(h.encode('idna').decode('utf-8'))
    parts[1] = '.'.join(newhost)
    #去掉 url 中的空格
    finalUrl = urlunsplit(parts).split(' ')[0]
    host = parse.urlparse(finalUrl).hostname
    if host == 'suctf.cc':
        return urllib.request.urlopen(finalUrl).read()
    else:
        return "我扌 your problem? 333"
    </code>
    <!-- Dont worry about the suctf.cc. Go on! -->
    <!-- Do you know the nginx? -->
```

这个题目似乎有一个姿势

![黑帽大会的ppt](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/suctf0.png)

urlparse函数

```python
zz :: ~ » python
Python 3.5.4 (v3.5.4:3f56838, Aug  8 2017, 02:17:05) [MSC v.1900 64 bit (AMD64)] on win32
Type "help", "copyright", "credits" or "license" for more information.
>>> from urllib.parse import urlparse
>>> r = "https://prontosil.club"
>>> urlparse_result = urlparse(r)
>>> urlparse_result
ParseResult(scheme='https', netloc='prontosil.club', path='', params='', query='', fragment='')
>>> urlparse_result.hostname
'prontosil.club'
>>>
```

## checkin

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/suctf1.png)

自己在nginx环境下进行了测试，成功地用了`.user.ini`复现了这个(开始的时候总是失败也是很迷了，似乎不能在index.php下进行测试)

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/suctf2.png)

上传一个`.user.ini`  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/suctf3.png)

然后上传一个马

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/suctf4.png)

然后直接访问就行了

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/suctf5.png)

orz服了

## 参考

[SUCTF 2019 web partial wp](https://www.xmsec.cc/suctf19-wp/)
