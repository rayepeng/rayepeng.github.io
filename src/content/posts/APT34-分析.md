---
title: 'APT34-分析'
date: 2019-01-01
category: '软件安全'
tags: []
lang: 'zh'
draft: true
---
HighShell 运行界面如下：
![](https://upload-images.jianshu.io/upload_images/10651191-b155e3ac5408db40.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

分析函数
```javascript
   function use() {
                var n = document;
                var d = n.getElementById("d").innerHTML;
                d = d.substring(0, d.lastIndexOf('\\') + 1);
                n.getElementsByName("cmd")[0].value += d;
                n.getElementsByName("sav")[0].value += d;
                n.getElementsByName("don")[0].value += d;
            }
```

这个函数的作用大致就是获取用户的输入，同时进行拼接

![](https://upload-images.jianshu.io/upload_images/10651191-4fd8c80646df5d96.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-20e9a25f5d1e2a7d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```javascript

//进行base64编码
            function subm() {
                var mmm = document.getElementsByClassName('mmm');
                for (var i = 0; i < mmm.length; i++) {
                    mmm[i].value = b64EncodeUnicode(mmm[i].value);
                }
            }
```

```javascript

//重置
            function reset() {
                document.cookie = "data=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/";
                location.href = location.pathname;
            }

```
