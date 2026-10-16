---
title: 'flask-SSTI攻击'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
先来看一下flask SSTI的攻击效果

![](https://upload-images.jianshu.io/upload_images/10651191-1f652ef398486531.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

稍微有点常识的人都知道是xss

来看一下这个开发者写的代码(手动滑稽)

```
from flask import Flask, render_template_string, request

app = Flask(__name__)

@app.route('/index')
def index():
    return "hello world"

@app.errorhandler(404)
def page_not_found(e):
    template = '''
{%% block body %%}
    <div class="center-content error">
        <h1>Oops! That page doesn't exist.</h1>
        <h3>%s</h3>
    </div>
{%% endblock %%}
''' % (request.url)
    return render_template_string(template), 404

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1')

```

可以看到这个开发者将用户输入的URL直接嵌入到了渲染的模板中
猜测一下 `render_template_string`应该是渲染字符串

除了xss， 还有这个

![](https://upload-images.jianshu.io/upload_images/10651191-c63a5d31733dfd8a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 接下来就是如何利用这个漏洞了

## 通过缺省的对象

所以这个时候有必要去了解一下jinja2模板的上下文

`requests`就是其中之一

`request.environ`对象是一个与服务器环境相关的对象字典，

字典中一个名为`shutdown_server`的方法名分配的键为`werkzeug.server.shutdown`，那么大家可以猜猜注射`{{ request.environ['werkzeug.server.shutdown']() }}`一个影响极低的拒绝服务，使用gunicorn运行应用程序这个方法的效果便消失，所以该漏洞局限性还是挺大的。

看下效果
![](https://upload-images.jianshu.io/upload_images/10651191-9bff730b549c192c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

服务器直接停了

![](https://upload-images.jianshu.io/upload_images/10651191-58b6c501c5261394.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

`config`对象也是其中之一
config也是Flask模版中的一个全局对象，它代表“当前配置对象(flask.config)”，它是一个类字典的对象，它包含了所有应用程序的配置值。在大多数情况下，它包含了比如数据库链接字符串，连接到第三方的凭证，SECRET_KEY等敏感值。查看这些配置项目，只需注入{{ config.items() }}有效载荷。

然后就看到了很多不该看的东西

![](https://upload-images.jianshu.io/upload_images/10651191-49e4011295f296bf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 继续测试

这里似乎只能在python2中才有
![](https://upload-images.jianshu.io/upload_images/10651191-6c7443c9f601c6d8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后就可以这样子调用了

![](https://upload-images.jianshu.io/upload_images/10651191-e3347ead285ffc02.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 栗子

![](https://upload-images.jianshu.io/upload_images/10651191-cf3a305ebc064f0d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

比如这个我在本地搭建的题目

![没有任何过滤](https://upload-images.jianshu.io/upload_images/10651191-c1692f11df4fc8de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

当然我这里环境不全

这个才是结果

![](https://upload-images.jianshu.io/upload_images/10651191-4c79e30852714237.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

接下来可以看看我们这次的题目了

![](https://upload-images.jianshu.io/upload_images/10651191-98d94575f08c28ba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

毫无疑问是存在SSTI漏洞的

但是这里加了一个正则表达式

![](https://upload-images.jianshu.io/upload_images/10651191-900a2df126664fbc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们测试一下

是可以进行注入的

关键是如何绕过正则表达式

![](https://upload-images.jianshu.io/upload_images/10651191-61a3935933fc4ef1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

显然()是被过滤了的

![](https://upload-images.jianshu.io/upload_images/10651191-67150114d21b2617.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

xss注入式存在的， 不过两个括号都被过滤了

![](https://upload-images.jianshu.io/upload_images/10651191-124b745186b92a56.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可是括号为什么会被过滤呢？？

这个正则表达式中不是只有 
> { } [ ] \w \s ' % 

这些字符吗

跟我说这个字符被找到了？？？

![](https://upload-images.jianshu.io/upload_images/10651191-53d7fa21450b079f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可是我都没有写`[]`这些字符哇

发现是我想错了
那就是小括号都会被拦截掉的

![](https://upload-images.jianshu.io/upload_images/10651191-2c9c12fd5b33d460.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

大概了解了正则表达式的特点之后， 我们开始看`jinja2`的模板吧

# 模板中内置的上下文

`config` 当前的配置对象
`request`当前的请求对象
`session` 当前的会话对象
`g` 与请求绑定的全局变量

比如`{{ request.environ['werkzeug.server.shutdown']() }}`
`{{ config.items() }}` 等

**我突然有个想法， 既然(被过滤了， 1. )还能用 2， 函数就无法执行？**

这时候过滤器出现了

过滤器在 `jinja2`中是一个类似于管道的东东

比如
`{{name | title}}`

就会将`name`变量的值标题化
也就是相当于 `name.title()`这样

![像这样](https://upload-images.jianshu.io/upload_images/10651191-d35d18a270e95ddc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

还有 `{{movies | length}}`这样

转自szf大佬

>  毫无疑问如果要用魔法函数，那么必须就要使用`_`
 jinja2模板中有很多有用的内置过滤器，可以[“看看这”](http://docs.jinkan.org/docs/jinja2/templates.html#builtin-filters)这里我要介绍的是`attr`和`join`这两个过滤器。`{{request|attr("get")}}`就相当于`{{request.get}}` 。`{{request|attr(["_"*2,"class","_"*2]|join)}}`相当于`{{request.__class__}}` 但是我们这样似乎还是无法过滤`_` ，因为还是要输入才行呀。不过，我们前面讲过，被过滤的关键字和字符我们可以从`request`里取出，我们可以在get、post、header、cookies里传一个值，然后用`request.cookies['var']`获取
 理论上，我们可以用这种方法绕过任何关键字过滤。

比如通过post传值

![](https://upload-images.jianshu.io/upload_images/10651191-def91418a423719b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

目前可以确定的是只要有了括号就不可以绕过正则
当然只能用左括号

![](https://upload-images.jianshu.io/upload_images/10651191-3bbb9f1b4cfd3e33.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

从目前来看这个题目大概就是这样子

但是怎么利用呢？

现在才明白这里的判断是什么意思
只要有'(' 且 res不为NULL

![](https://upload-images.jianshu.io/upload_images/10651191-886ba1226182eacb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

目前来看， 似乎还没有找到一种绕过的方式
构造的URL
`url = "http://127.0.0.1:5000/{{request.cookies['admin']}}"`

`["{{request.cookies['admin']}}"]`
被正则表达式检测到了

URL编码也试了， 但是还是被检测出来了

![](https://upload-images.jianshu.io/upload_images/10651191-066bb01d804031ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

__虽然没有被过滤
但是左括号存在

![](https://upload-images.jianshu.io/upload_images/10651191-c76cbce84051f236.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 我似乎成功地绕过了?

![](https://upload-images.jianshu.io/upload_images/10651191-ad2806b1f5d11807.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

之后呢。

![](https://upload-images.jianshu.io/upload_images/10651191-c1b15aa9ea9b3354.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其实我觉得我快要接近成功了， 但是

然后就发现了又一种绕过

![](https://upload-images.jianshu.io/upload_images/10651191-b25d6a7fc5adf480.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Th1s_S5cr5t_Key_Y0u_Nev5R_GuSs5d

![](https://upload-images.jianshu.io/upload_images/10651191-a4490f75bf34b146.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

利用密钥伪造session

![](https://upload-images.jianshu.io/upload_images/10651191-d476ec02515d7fbd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

得到flag
![](https://upload-images.jianshu.io/upload_images/10651191-9881f09b5c8adca7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
