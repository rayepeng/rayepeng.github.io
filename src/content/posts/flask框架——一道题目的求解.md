---
title: 'flask框架——一道题目的求解'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
先看我对题目的源码分析

# 1

```
def trigger_event(event):
	session['log'].append(event)
	if len(session['log']) > 5: session['log'] = session['log'][-5:]
	if type(event) == type([]):
		request.event_queue += event
	else:
		request.event_queue.append(event)

```

一个触发事件的函数， 传入event， 并且对event的类型进行判断， type([])是list数据类型

关于这个event_queue 稍后再说

```
def get_mid_str(haystack, prefix, postfix=None):
	haystack = haystack[haystack.find(prefix)+len(prefix):]
	if postfix is not None:
		haystack = haystack[:haystack.find(postfix)]
	return haystack
```
这个函数是用来解析参数的

haystack.find 
还不知道这三个参数的具体数据类型

# 2 看入口点
```
@app.route(url_prefix+'/')
def entry_point():
	querystring = urllib.unquote(request.query_string)
	request.event_queue = []
	if querystring == '' or (not querystring.startswith('action:')) or len(querystring) > 100:
		querystring = 'action:index;False#False'
	if 'num_items' not in session:
		session['num_items'] = 0
		session['points'] = 3
		session['log'] = []
	request.prev_session = dict(session)
	trigger_event(querystring)
	return execute_event_loop()
```

urllib.unquote()  将query_string 的URL编码转换为字符

然后初始化request.event_queue 列表

querystring 不能为空， 且必须以action: 或者长度大于100

![](https://upload-images.jianshu.io/upload_images/10651191-ce0e25c4a7b3129d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以明确的是 query_string 就是? 后面的一串字符

之后就是对session 进行初始化了， 猜测session 应该是一个二维的list

那么这句话的作用就是
```
if len(session['log']) > 5: session['log'] = session['log'][-5:]
```

并且， 调用trigger_event(querystring) 触发事件

# 3 

```
is_action = event[0] == 'a'
			action = get_mid_str(event, ':', ';')
			args = get_mid_str(event, action+';').split('#')
			try:
				event_handler = eval(action + ('_handler' if is_action else '_function'))
				ret_val = event_handler(args)
```

event是一系列事件

根据输入的字符进行拼接出函数

比如现在 query_string  = action:buy;1

传入函数 
```
def execute_event_loop():
```
之后会进行解析

显然现在 is_action  = 1
并且在event中去get_mid_str()
下图是 buy
所以就是调用了buy_handler函数

![](https://upload-images.jianshu.io/upload_images/10651191-223733d6a8a606ad.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

当然不会这么简单哈哈哈哈
![](https://upload-images.jianshu.io/upload_images/10651191-517617a972f14676.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

抱着试一试的心态，成功解密flask 的session

![](https://upload-images.jianshu.io/upload_images/10651191-bf0e20cf172693cf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
{'points': 3, '
log': [b'action:view;index', 
b'action:get_flag;1', 
b'action:view;index', 
b'action:get_flag;1', 
b'action:view;index'],
 'num_items': 0}
```

ok到现在为止这道题目我大概明白了

```
def show_flag_function(args):
	flag = args[0]
	#return flag # GOTCHA! We noticed that here is a backdoor planted by a hacker which will print the flag, so we disabled it.
	return 'You naughty boy! ;) <br />'
	
def get_flag_handler(args):
	if session['num_items'] >= 5:
		trigger_event('func:show_flag;' + FLAG()) # show_flag_function has been disabled, no worries
	trigger_event('action:view;index')
```
重点显然是上面两个函数

其实session['num_items'] 就是session中的值
所以这个应该是一道伪造session的题目了
但是我不知道怎么伪造

还有， 即便我能做到， 但是
![](https://upload-images.jianshu.io/upload_images/10651191-c1b1e624b5b6df32.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

无非就是调用了这个函数， 那我还能拿到flag咩

蜜汁微笑

坐等wp
