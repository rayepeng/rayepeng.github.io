---
title: 学习使用Makefile来管理项目
published: 2024-11-11
description: ''
image: ''
tags: ['post', '开发', 'Makefile', '技术']
category: '周报'
draft: false
lang: ''
---
 学习使用Makefile来管理项目


<!-- ![Group 4](./attachments/bafkreielcl72bzqkclihhh4dohq6yrg5cb6l5wekpij5a4jttnqclnxhnq.png) -->


一直以为Makefile是独属于C++项目的，看到这个文件就比较头大，因为少不了需要执行一堆make命令来等待编译链接。

不过最近才了解到，make命令其实并没有那么神秘，相反，它可以有效地组织开发项目中会使用到的各种命令、环境变量、shell命令等。

除此之外，Makefile的一大好处就是可以配置一些自动化的前置步骤，比如python项目的pip install， node项目的npm install等

最后，Makefile还可以依赖本地的文件，如果文件没有更新，则与之相应的任务并不会执行，有点类似于本地的CI了

接下来就认识一下Makefile的简单编写以及实例吧

 Makefile的基础语法

 .PHONY

因为Makefile的设计初衷其实是监控本地的文件是否有更新，再去触发一系列动作，所以单纯的shell命令执行得使用.PHONY（虚假）来实现，比如

```makefile
dev:
	@echo "Hello, world!"
.PHONY: dev
```

 依赖

Makefile是分步骤进行的，每一个步骤都会有其前置任务，其写法一般是：

```makefile
target1 [target2 ...]: [pre-req1 pre-req2 pre-req3 ...]
    [recipes
    ...]
```

最简单的举例，比如我们想执行一个next.js项目的本地预览，其前置条件必须是已经安装了对应的dependences，那么就可以这样写：


```makefile
dev: node_modules  开启本地服务
	@./node_modules/.bin/next dev
.PHONY: dev

node_modules: package.json
	@yarn install
```


这里就构成了一个依赖的执行顺序：

1. 执行 make dev，会检查前置条件 node_modules（注意这是一个步骤的命名）
2. node_modules步骤依赖于package.json，即首先会执行一次 yarn install，后续如果package.json如果更新了才会执行

根据上述简单的示例就可以看到，Makefile可以让我们清晰有序地管理一些常见的开发步骤，免去诸如修改package.json但是忘记执行yarn install的“悲剧”

 帮助文档

可以看到在上面的示例中，有通过 `` 来编写注释

此时如果在Makefile中加入下面这段：

```makefile
help:  Show this help
	@echo "\nSpecify a command. The choices are:\n"
	@grep -E '^[0-9a-zA-Z_-]+:.*? .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*? "}; {printf "  \033[0;36m%-12s\033[m %s\n", $$1, $$2}'
	@echo ""
.PHONY: help
```


就可以自动生成注释了，即输入 make help 自动打印帮助文档，是不是非常神奇呢hh

 简单示例：使用Makefile来管理你的hugo博客

hugo管理博客有几个最简单的命令，如开启服务器，生成站点静态文件等，我们可以将其都放在一个Makefile中

```makefile
all: help  默认打开帮助文档


serve:  启动服务器
	@echo "Starting Hugo server..."
	hugo server

build:  构建站点
	@echo "Building the site..."
	hugo 

clean:  清理生成的文件
	@echo "Cleaning up the public directory..."
	rm -rf public/

help:  Show this help
	@echo "\nSpecify a command. The choices are:\n"
	@grep -E '^[0-9a-zA-Z_-]+:.*? .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*? "}; {printf "  \033[0;36m%-12s\033[m %s\n", $$1, $$2}'
	@echo ""

.PHONY: all serve build clean help
```

默认的命令 `all` 就是显示帮助文档，而帮助文档的生成只需要写清楚注释即可自动完成，现在输入make命令的效果如下：

```bash
$:~/develop$ make

Specify a command. The choices are:

  all          默认打开帮助文档
  serve        启动服务器
  build        构建站点
  clean        清理生成的文件
  help         Show this help
```

当然这里只是最简单的展示，你还可以根据需要添加对应的依赖文件，以及 new post的操作也都是可以集成进来的。


 一步步使用Makefile来管理python项目

 简单版本
首先，假设我们的python项目入口为app.py，那么我们最终执行的目标就是

```makefile
run:  记得加注释，可以自动生成帮助文档
  python app.py
.PHONY run  因为并没有依赖文件，所以需要使用.PHONY
```


其次，python肯定有前置依赖需要安装，一般依赖都会写在 requirements.txt，于是我们有

```makefile
setup: requirements.txt
    pip install -r requirements.txt
```

当然，一般还会补充一个clean的命令，于是有

```makefile
clean:
    rm -rf __pycache__
```

 进阶版本

由于每个人电脑上本地的python环境变量都不同，当然这个也可以用docker来解决，不过python本身提供了venv这种更轻量级的解决方案，于是可以

```bash
python3 -m venv venv
```

> -m venv代表使用venv命令，创建一个虚拟环境，位于venv目录

此时安装依赖就可以使用
```bash
./venv/bin/pip install -r requirements.txt
```

> 因为此时pip是位于 ./venv/bin/ 目录下的

所以得到Makefile


```makefile
venv/bin/activate: requirements.txt
 python3 -m venv venv
 ./venv/bin/pip install -r requirements.txt
```

但是每次都要写 `./venv/bin/` 比较麻烦，可以使用变量做一下简化

即声明一个变量 `VENV` 它的值默认为 `venv` 目录，但是你也可以通过命令行传递的方式来修改

引用变量的方式则是 `$(VENV)`，可以理解为简单的字符串替换，于是Makefile就可以修改为：

```makefile
VENV = venv
PYTHON = $(VENV)/bin/python3
PIP = $(VENV)/bin/pip

run: $(VENV)/bin/activate
 $(PYTHON) app.py
.PHONY run


$(VENV)/bin/activate: requirements.txt
 python3 -m venv $(VENV)
 $(PIP) install -r requirements.txt


clean:
 rm -rf __pycache__
 rm -rf $(VENV)
.PHONY clean
```

 简单总结

有了GPT之后，其实Makefile完全可以让GPT来代劳，对于其语法完全可以做一个简单了解，能看懂就行了，所以我也只列举出了最简单的语法以及对应的示例。

不得不说有了AI之后，诸如此类的工作已经完全不用开发者操心了。从另一个方面来说，以前觉得一些麻烦的，不太想了解的技术细节，其实往往有很多意想不到的作用。

具体到Makefile，完全可以将其当做一系列命令的封装，以及一些繁琐依赖人工记录的步骤，甚至可以将其当做README文件来使用了。








[]()