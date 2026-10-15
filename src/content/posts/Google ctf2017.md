---
title: 'Google ctf2017'
date: 2019-07-21
updated: 2019-08-20
category: 'ctf'
tags:
  - 'ctf'
lang: 'zh'
draft: false
---
有时候看看国外的ctf比赛的wp还是挺好的

[wp](https://ctftime.org/event/455/tasks/)

# Mindreder

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/google1.png)  
可以通过f参数直接读取到想读的文件

那么如何确定flag的位置？

既然可以读文件，那么第一步的想法就是读源码

![requirement](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/google6.png)

确定后端是flask

源码：

```python
from flask import Flask, request, abort
import re
import os
import logging

assert os.environ['FLAG']

app = Flask(__name__)

INDEX = open('index.html').read()

HALL_OF_SHAME = [
    '173.171.203.59',
    '2a02:6b8:b010:6026:84:201:185:197',
    '35.185.158.159',
    '81.17.25.8'
]

@app.route('/')
def index():
    for ip in request.headers.get('X-Forwarded-For', '').split(','):
        ip = ip.strip().lower()
        if ip in HALL_OF_SHAME:
            abort(403)

    if 'f' in request.args:
        try:
            f = request.args['f']
            if re.search(r'proc|random|zero|stdout|stderr', f):
                abort(403)
            elif '\x00' in f:
                abort(404)
            return open(f).read(4096)
        except IOError:
            abort(404)
    else:
        return INDEX
```

看到flag是藏在环境变量里面的，而环境变量就在`/proc/environ`中

那就直接去读呗

但是限制了：  

```python
if 'f' in request.args:
     try:
         f = request.args['f']
         if re.search(r'proc|random|zero|stdout|stderr', f):
             abort(403)
         elif '\x00' in f:
```

Linux中有一个叫做`symlink method`  
也就是相当于一个快捷方式，但是却不同于Windows中的shortcut  
而正好：`/dev/fd`这个指向了`/proc/self/fd`这样payload就不难理解了：  
`/dev/fd/../environ`  
访问`/dev/fd`就相当于访问了`/proc/self`之后回退一次就可以找到`environ`这个文件了

Linux中 `/dev/fd/0`运行效果是这样的，相当于你输入啥它就会回答啥  

```
 ✘ pxy@LAPTOP-UBIEP4K5  ~  sudo cat /dev/fd/0
a
a
pxy
pxy
```

接下来了解一下ln命令

-   软链接：英文`symbolic link`非常类似于Windows中的快捷方式
-   硬链接：英文`hard link`这类文件会拥有自己的inode节点和名称，其inode会指向文件内容所在的数据块emmm后面不是很懂了

建立软链接的方式：  
`ln -s 源文件名称 软链接文件名称`  
目录和文件均可

现在当前目录下创建一个指向`/proc/sys`的链接  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/google2.png)

然后我们就可以通过目录遍历来进入到其他的目录了。  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/google3.png)

软链接还会存在这个问题：

链接的重复定义  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/google4.png)

这样就不会出问题了，加个`-n`选项  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/google5.png)

[参考](https://medium.com/@forwardsecrecy/google-ctf-2017-mindreader-570e8acf53b7)  
[GoogleCTF - Mindreader](https://www.rootnetsec.com/googlectf-mindreader/)
