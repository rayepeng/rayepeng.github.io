---
title: 'bugkuctf-wp3'
date: 2019-01-01
category: 'bugku-Writeup'
tags: []
lang: 'zh'
draft: true
---
# login2

抓包后得到base64加密的数据，解码：
```
$sql="SELECT username,password FROM admin WHERE username='".$username."'";
if (!empty($row) && $row['password']===md5($password)){
}
```
构造了一个sql语句

if条件判断， $row是个数组， 且

# login3

题目提示是基于布尔的SQL盲注

用户名是admin
