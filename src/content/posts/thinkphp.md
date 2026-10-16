---
title: 'thinkphp'
date: 2019-01-01
category: '代码审计'
tags: []
lang: 'zh'
draft: true
---
## 如何启动一个thinkphp应用

可以直接用`php`内置的web服务器
`php -S localhost:8888 router.php`

或者直接拖放到web目录下，然后访问`localhost/public`就会默认访问到thinkphp的`index.php/index/index`

解释一下三个`index`的含义，由于没有指明具体的控制器，所以默认访问index.php,index模块的index方法

典型的URL访问:
```
http://serverName/index.php（或者其它应用入口文件）/模块/控制器/操作/[参数名/参数值...]
```
一般是支持`pathinfo`访问，如果是不支持的可以采用兼容模式：

> http://serverName/index.php（或者其它应用入口文件）?s=/模块/控制器/操作/[参数名/参数值...]

## 隐藏入口文件——URL重写

[Apache]
1. httpd.conf配置文件中加载了mod_rewrite.so模块
2. AllowOverride None 将None改为 All
3. 把下面的内容保存为.htaccess文件放到应用入口文件的同级目录下

```
<IfModule mod_rewrite.c>
  Options +FollowSymlinks -Multiviews
  RewriteEngine On

  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^(.*)$ index.php/$1 [QSA,PT,L]
</IfModule>
```
最后一条规则`RewriteRule ^(.*)$ index.php/$1 [QSA,PT,L]`就是将所有匹配到的字符都加到`index.php`的后面
