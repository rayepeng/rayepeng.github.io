---
title: 'phpmyadmin远程文件包含漏洞'
date: 2019-08-19
updated: 2019-08-20
category: 'ctf'
tags:
  - 'php'
  - 'LFI'
lang: 'zh'
draft: false
---
phpmyadmin 这个漏洞可以说是由于太过细心而导致的，这也证实了安全永远在路上

这个本地文件包含的漏洞确实挺巧妙地，分析一下：

## 漏洞利用分析

在GitHub上找了一下phpmyadmin的源码，不过话说我还不知带phpmyadmin怎么安装，之后研究一下

[index.php](https://github.com/phpmyadmin/phpmyadmin/blob/81fb6f75621ee2004c9406abdfb5f72de318af33/index.php#L55)

看到这串代码if判断很多，主要是最后一个判断

```php
if (! empty($_REQUEST['target'])
    && is_string($_REQUEST['target'])
    && ! preg_match('/^index/', $_REQUEST['target'])
    && ! in_array($_REQUEST['target'], $target_blacklist)
    && Core::checkPageValidity($_REQUEST['target'])
) {
    include $_REQUEST['target'];
    exit;
}
```

注意`preg_match('/^index/', $_REQUEST['target'])`是判断是不是以index开头，如果是就返回true，但是由于`!`所以就不能以index开头，类似这种判断不要被绕晕了

`Core::checkPageValidity`检查，问题就出在这，方法定义在[443行](https://github.com/phpmyadmin/phpmyadmin/blob/81fb6f75621ee2004c9406abdfb5f72de318af33/libraries/classes/Core.php#L443)

黑名单如下  

```php
$target_blacklist = array (
    'import.php', 'export.php'
);
```

方法具体如下：  

```php
public static function checkPageValidity(&$page, array $whitelist = [])
{
    if (empty($whitelist)) {
        $whitelist = self::$goto_whitelist;
    }
    if (! isset($page) || !is_string($page)) {
        return false;
    }
    if (in_array($page, $whitelist)) {
        return true;
    }
    $_page = mb_substr(
        $page,
        0,
        mb_strpos($page . '?', '?')
    );
    if (in_array($_page, $whitelist)) {
        return true;
    }
    $_page = urldecode($page);
    $_page = mb_substr(
        $_page,
        0,
        mb_strpos($_page . '?', '?')
    );
    if (in_array($_page, $whitelist)) {
        return true;
    }
    return false;
}
```

如果我们两个词URL编码。即`%253f` 浏览器传送之后变成`%3f`此时前两次if都不会进去，最后一次先`urldecode`，那么就变成了`?` 这时候是可以绕过的。

之所以要两次编码，直接用一个”?”不也可以绕过吗。

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/php0.png)

会导致这样的问题不能包含成功，具体为什么我也不是很清楚

## hctf2018

这篇[文章](https://www.jianshu.com/p/0d75017c154f)已经讲的很详细了，这里写一下hctf2018的一道热身题，当时都还没仔细想过是一个已经存在的CVE

题目源码：

```php
<?php
    highlight_file(__FILE__);
    class emmm
    {
        public static function checkFile(&$page)
        {
            $whitelist = ["source"=>"source.php","hint"=>"hint.php"];
            if (! isset($page) || !is_string($page)) {
                echo "you can't see it";
                return false;
            }

            if (in_array($page, $whitelist)) {
                return true;
            }

            $_page = mb_substr(
                $page,
                0,
                mb_strpos($page . '?', '?')
            );
            if (in_array($_page, $whitelist)) {
                return true;
            }

            $_page = urldecode($page);
            $_page = mb_substr(
                $_page,
                0,
                mb_strpos($_page . '?', '?')
            );
            if (in_array($_page, $whitelist)) {
                return true;
            }
            echo "you can't see it";
            return false;
        }
    }

    if (! empty($_REQUEST['file'])
        && is_string($_REQUEST['file'])
        && emmm::checkFile($_REQUEST['file'])
    ) {
        include $_REQUEST['file'];
        exit;
    } else {
        echo "<br><img src=\"https://i.loli.net/2018/11/01/5bdb0d93dc794.jpg\" />";
    }  
?>
```

题目要绕过不算难，但是有一个地方很重要

这是我在本地调试的目录：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/hctf0.png)

调试的时候我使用了如下payload

`http://localhost/audit/warmup.php?file=source.php%253f/../flag.php`

此时能够成功绕过

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/hctf1.png)

就在这种情况下，文件包含也是成功的！

根据题目提示flag在某个位置，其实这里靠猜了，因为只能用`../`这样的来回到上一级目录

## 参考

[phpmyadmin4.8.1远程文件包含漏洞](https://www.jianshu.com/p/0d75017c154f)  
[phpmyadmin4.8.1后台getshell](https://mp.weixin.qq.com/s?__biz=MzIzMTc1MjExOQ==&mid=2247485036&idx=1&sn=8e9647906c5d94f72564dec5bc51a2ab&chksm=e89e2eb4dfe9a7a28bff2efebb5b2723782dab660acff074c3f18c9e7dca924abdf3da618fb4&mpshare=1&scene=1&srcid=0621gAv1FMtrgoahD01psMZr&pass_ticket=LqhRfckPxAVG2dF%2FjxV%2F9%2FcEb5pShRgewJe%2FttJn2gIlIyGF%2FbsgGmzcbsV%2BLmMK#rd)

[phpMyAdmin 4.8.x 本地文件包含漏洞利用](https://blog.vulnspy.com/2018/06/21/phpMyAdmin-4-8-x-LFI-Exploit/)

突然还发现一个可以复现很多漏洞的地方 [https://www.vulnspy.com/phpmyadmin-4.8.1/](https://www.vulnspy.com/phpmyadmin-4.8.1/)

github地址： [https://github.com/vulnspy/phpmyadmin-4.8.1](https://github.com/vulnspy/phpmyadmin-4.8.1)
