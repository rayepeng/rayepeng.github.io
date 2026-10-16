---
title: 'PHP语法摘录'
date: 2019-01-01
category: '代码审计'
tags: []
lang: 'zh'
draft: true
---
#### 写在前面
最近在复习PHP的语法， 毕竟代码审计这方面还是比较弱。 过年的这几天也提不上学习的动力， 就只好不断地更新自己的博客比较好了

#### 数组

```
<?php
$cars=array("Volvo","BMW","Toyota");
echo "I like " . $cars[0] . ", " . $cars[1] . " and " . $cars[2] . ".";
?>
```
. 拼接字符串

PHP大致有三种类型的数组
* 数值数组， 和C语言的数组很相似， 键值默认从0开始
* 关联数组， 相当于python中的dict类型
* 多维数组

涉及到几个函数
##### 获取数组的长度-count()函数

##### 遍历数值数组
```
<?php
$cars=array("Volvo","BMW","Toyota");
$arrlength=count($cars);
 
for($x=0;$x<$arrlength;$x++)
{
    echo $cars[$x];
    echo "<br>";
}
?>
```

##### 遍历关联数组
```
<?php
$age=array("Peter"=>"35","Ben"=>"37","Joe"=>"43");
 
foreach($age as $x=>$x_value)
{
    echo "Key=" . $x . ", Value=" . $x_value;
    echo "<br>";
}
?>
```

#### 多维数组
实例：
```
<?php
// 二维数组:
$cars = array
(
    array("Volvo",100,96),
    array("BMW",60,59),
    array("Toyota",110,100)
);
?>
```
---

#### 几个函数的区别

##### echo函数
可以一次输出多个值， echo是语言结构， 并不是真正的函数

##### print()
打印一个值， 打印成功返回true， 打印失败返回false

##### print_r()
可以把字符串和数字简单地打印出来，而数组则以括起来的键和值得列表形式显示，并以Array开头。但print_r()输出布尔值和NULL的结果没有意义，因为都是打印"\n"。因此用var_dump()函数更适合调试。

###### var_dump()
判断一个变量的类型与长度,并输出变量的数值,如果变量有值输的是变量的值并回返数据类型。此函数显示关于一个或多个表达式的结构信息，包括表达式的类型与值。数组将递归展开值，通过缩进显示其结构。

#### PHP Cookie
我的理解： client在请求的时候， server 端会 通过 setcookie函数 将一些键值对发送给 client端， 之后 client端 再去访问的时候就会带上 cookie
##### 如何创建cookie
setcookie() 函数用于设置 cookie。

**注释**：setcookie() 函数必须位于 <html> 标签之前。

创建一个名字为 "user" 的cookie， 并赋值为 "runoob", 并规定cookie在一小时后失效
```
<?php
setcookie("user", "runoob", time()+3600);
?>
```
**注释**：在发送 cookie 时，cookie 的值会自动进行 URL 编码，在取回时进行自动解码。（为防止 URL 编码，请使用 setrawcookie() 取而代之。）

##### 获得cookie的值
PHP 的 $_COOKIE 变量用于取回 cookie 的值。

在下面的实例中，我们取回了名为 "user" 的 cookie 的值，并把它显示在了页面上：
```
<?php
// 输出 cookie 值
echo $_COOKIE["user"];

// 查看所有 cookie
print_r($_COOKIE);
?>
```

可以使用 `isset() `函数来确定是否这是了cookie

##### 如何删除cookie
将cookie失效的时间改成过去的时间点
```
<?php
// 设置 cookie 过期时间为过去 1 小时
setcookie("user", "", time()-3600);
?>
```

#### PHP session
PHP session 变量用于存储关于用户会话（session）的信息，或者更改用户会话（session）的设置。Session 变量存储单一用户的信息，并且对于应用程序中的所有页面都是可用的。

##### 开始PHP session
首先必须启动会话

`session_start()`函数必须位于<html>标签之前
```
<?php session_start(); ?>

<html>
<body>

</body>
</html>
```

##### 存储session变量
存储和取回 session 变量的正确方法是使用 PHP $_SESSION 变量：
```
<?php
session_start();
// 存储 session 数据
$_SESSION['views']=1;
?>
```

##### 创建一个简单地page-view计数器
```
<?php
session_start();

if(isset($_SESSION['views']))
{
    $_SESSION['views']=$_SESSION['views']+1;
}
else
{

    $_SESSION['views']=1;
}
echo "浏览量：". $_SESSION['views'];
?>
```

##### 销毁session
unset() 函数用于释放指定的 session 变量

通过调用 session_destroy() 函数彻底销毁 session

#### PHP过滤器简介

常见的过滤器函数
* filter_var() - 通过一个指定的过滤器来过滤单一的变量
* filter_var_array() - 通过相同的或不同的过滤器来过滤多个变量
* filter_input() - 获取一个输入变量，并对它进行过滤
* filter_input_array() - 获取多个输入变量，并通过相同的或不同的过滤器对它们进行过滤

示例1：
```
<?php
$int = 123;
 
if(!filter_var($int, FILTER_VALIDATE_INT))
{
    echo("不是一个合法的整数");
}
else
{
    echo("是个合法的整数");
}
?>
```

##### options 
```
<?php
$var=300;
 
$int_options = array(
    "options"=>array
    (
        "min_range"=>0,
        "max_range"=>256
    )
);
 
if(!filter_var($var, FILTER_VALIDATE_INT, $int_options))
{
    echo("不是一个合法的整数");
}
else
{
    echo("是个合法的整数");
}
?>
```

##### 过滤多个输入
```
<?php
$filters = array
(
    "name" => array
    (
        "filter"=>FILTER_SANITIZE_STRING
    ),
    "age" => array
    (
        "filter"=>FILTER_VALIDATE_INT,
        "options"=>array
        (
            "min_range"=>1,
            "max_range"=>120
        )
    ),
    "email"=> FILTER_VALIDATE_EMAIL
);
 
$result = filter_input_array(INPUT_GET, $filters);
 
if (!$result["age"])
{
    echo("年龄必须在 1 到 120 之间。<br>");
}
elseif(!$result["email"])
{
    echo("E-Mail 不合法<br>");
}
else
{
    echo("输入正确");
}
?>
```

#### 关于form表单
##### form表单的四种属性

> * action : url 地址， 服务器接收表单数据的地址
> * method : 提交服务器的http方法，一般为post或者get
> * name：
> * enctype: 表单数据提交使用的编码类型， 默认使用 "application/x-www-form-urlencoded"  如果使用的是post请求，则请求头中的 `content-type` 指定值就是改值。 如果表单中有上传文件， 编码类型需要使用 `multipart/form-data` 类型才能完成传递文件数据

##### 浏览器提交表单时执行的步骤
> 1、识别出表单中表单元素的有效项，作为提交项
> 2、构建一个表单数据集
> 3、根据form表单中的enctype属性的值作为content-type对数据进行编码
> 4、根据form表单中的action属性和method属性向指定的地址发送数据

##### 四种常见的post请求提交数据的方式
1.application/x-www-form-urlencoded
2.multipart/form-data
3.application/json
4.text/xml

---
总算沉下心来花时间把这些东西整理了一下。 PHP， form， http， 这几样东西其实本身是联系在一起的， 可能之前学习的时候把它们忽视掉了。

#### 参考资料
[菜鸟教程](http://www.runoob.com/php/php-tutorial.html)
[echo, print(), print_r(), var_dump()的区别](https://www.cnblogs.com/tylerdonet/p/3702527.html)
[多维数组示例](http://www.runoob.com/try/showphp.php?filename=demo_array_multi)
[Form表单、四种常见的POST请求提交数据方式](https://blog.csdn.net/bigtree_3721/article/details/82809459)
