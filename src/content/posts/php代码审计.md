---
title: 'php代码审计'
date: 2019-01-01
category: '代码审计'
tags: []
lang: 'zh'
draft: true
---
# ch1 - #phpbug69892

```
<?php
$users = array(
        "0:9b5c3d2b64b8f74e56edec71462bd97a" ,
        "1:4eb5fb1501102508a86971773849d266",
        "2:facabd94d57fc9f1e655ef9ce891e86e",
        "3:ce3924f011fe323df3a6a95222b0c909",
        "4:7f6618422e6a7ca2e939bd83abde402c",
        "5:06e2b745f3124f7d670f78eabaa94809",
        "6:8e39a6e40900bb0824a8e150c0d0d59f",
        "7:d035e1a80bbb377ce1edce42728849f2",
        "8:0927d64a71a9d0078c274fc5f4f10821",
        "9:e2e23d64a642ee82c7a270c6c76df142",
        "10:70298593dd7ada576aff61b6750b9118"
);

$valid_user = false;

$input = $_COOKIE['user'];
$input[1] = md5($input[1]);

foreach ($users as $user)
{
        $user = explode(":", $user);
        if ($input === $user) {
                $uid = $input[0] + 0;
                $valid_user = true;
        }
}

if (!$valid_user) {
        die("not a valid user\n");
}

if ($uid == 0) {

        echo "Hello Admin How can I serve you today?\n";
        echo "SECRETS ....\n";

} else {
        echo "Welcome back user\n";
}
?>

```

## 如何在cookie中传入一个数组

## explode函数

由于PHP版本的限制， 无法再现这一个bug

# ch2- is_numeric
```
<?php
show_source(__FILE__);
$flag = "xxxx";
if(isset($_GET['time'])){ 
        if(!is_numeric($_GET['time'])){ 
                echo 'The time must be number.'; 
        }else if($_GET['time'] < 60 * 60 * 24 * 30 * 2){ 
                        echo 'This time is too short.'; 
        }else if($_GET['time'] > 60 * 60 * 24 * 30 * 3){ 
                        echo 'This time is too long.'; 
        }else{ 
                sleep((int)$_GET['time']); 
                echo $flag; 
        } 
                echo '<hr>'; 
}
?>
```

做如下测试代码：
```
<?php
highlight_file("test.php");

error_reporting(0);
$temp = $_GET['temp'];
echo (int)$temp;
echo "</br>";

echo is_numeric($temp);

?>

```
输入 `temp` 为以下值时：

* 0.1e11
> (int)temp = 0, is_numeric(temp)=1

* 0353
> (int)temp = 353, is_numeric(temp)=1

* 0x35a3
> (int)temp = 0, is_numeric(temp)=1

* 0.000000000001
> (int)temp = 0, is_numeric(temp)=1

# ch3-file_put_contents

```
<?php
$str = addslashes($_GET['option']);
$file = file_get_contents('xxxxx/option.php');
$file = preg_replace('|\$option=\'.*\';|', "\$option='$str';", $file);
file_put_contents('xxxxx/option.php', $file);

?>
```

这个题目是我见过的最有趣的题目233

先补充几个函数

## addslashes()

这个函数会转义字符

## file_get_contents()
将一个文件的内容读进一个变量

## file_put_contents() 
在一个文件之后追加字符串
