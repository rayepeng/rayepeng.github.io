---
title: 'phpstorm+xdebug单步调试'
date: 2019-01-01
category: '代码审计'
tags: []
lang: 'zh'
draft: true
---
之前一直没有配置成功phpstorm+xdebug远程调试

还是要多多熟悉一下phpstorm,虽然vs code也是很不错的调试工具，但是用phpstorm可以看的更清晰一点

由于要php7的环境，于是phpstudy切换到php7

![phpstudy](https://upload-images.jianshu.io/upload_images/10651191-979890c9abbb592c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后将phpinfo导出
![phpinfo](https://upload-images.jianshu.io/upload_images/10651191-d2b6de8b97edce1c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

去xdebug官网[https://xdebug.org/wizard.php](https://xdebug.org/wizard.php)
将phpinfo信息粘贴，然后按步骤来
![xdebug](https://upload-images.jianshu.io/upload_images/10651191-6be7511c7ca211c2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

由于要在phpstorm中调试
最后的配置文件如下：

```
[XDebug]
xdebug.profiler_output_dir="E:\ProgramFiles\phpstudy\PHPTutorial\tmp\xdebug"
xdebug.trace_output_dir="E:\ProgramFiles\phpstudy\PHPTutorial\tmp\xdebug"
zend_extension=E:\ProgramFiles\phpstudy\PHPTutorial\php\php-7.1.13-nts\ext\php_xdebug-2.7.2-7.1-vc14-nts.dll
xdebug.remote_enable = on
xdebug.remote_handler = dbgp
xdebug.remote_mode = req
xdebug.remote_host = localhost
xdebug.remote_port = 9000
xdebug.idekey = PHPSTORM
```

chrome安装插件
![设置IDEKey](https://upload-images.jianshu.io/upload_images/10651191-4b9e4f2cfbeb1d23.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后刷新一下页面就成了
![单步调试](https://upload-images.jianshu.io/upload_images/10651191-1154577dedcd1dca.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[参考](http://www.mayanlong.com/archives/2017/phpstorm-xdebug.html)
