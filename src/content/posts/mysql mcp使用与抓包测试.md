---
title: mysql mcp使用与抓包测试
published: 2025-10-29
description: ''
customSlug: 'mysql-mcp-usage-and-packet-capture'
image: ''
tags: ['MySQL', '编程', 'MCP']
category: '编程'
draft: false 
lang: ''
---

## 环境配置

使用docker开启mysql非常方便

首先开启一个mysql server

```bash
docker run -itd --name mysql_server -p3306:3306 --rm   -e MYSQL_ROOT_PASSWORD=123456 mysql
```

然后开启mysql client再通过 --link 连接到mysql server

```bash
docker run -it --rm  --name mysql_client  --link mysql_server:mysql_server mysql mysql -hmysql_server -uroot -p
```

`--link mysql_server:mysql_server` 这会把名为 mysql_server 的容器的 IP 地址映射到 mysql_server 这个主机名，第二个容器（mysql_client）可以通过该主机名访问第一个容器的 MySQL 服务。


mcp工具选择：https://github.com/wenb1n-dev/mysql_mcp_server_pro

启动：

```bash
# clone仓库
git clone https://github.com/wenb1n-dev/mysql_mcp_server_pro

#同步依赖
uv sync 

# 指定.env启动，神奇的是这里必须绝对路径
uv run -m mysql_mcp_server_pro.server --envfile /Users/rayepeng/Documents/code/ida-mcp-reverse/WeChatMiniGame_WebInstaller/.env
```

.env 文件内容

```
# MySQL Database Configuration
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=123456
MYSQL_DATABASE=information_schema
# Optional, default is 'readonly'. Available values: readonly, writer, admin
MYSQL_ROLE=admin
```

### 神奇的错误

不然会遇到这个神奇的错误：

> ps .env 文件放在源码目录下也是不行的？好神奇

```bash
❯ uv run -m mysql_mcp_server_pro.server --envfile /Users/rayepeng/Documents/code/mysql_mcp_server_pro/.env
Traceback (most recent call last):
  File "<frozen runpy>", line 198, in _run_module_as_main
  File "<frozen runpy>", line 88, in _run_code
  File "/Users/rayepeng/Documents/code/mysql_mcp_server_pro/src/mysql_mcp_server_pro/server.py", line 28, in <module>
    from .oauth import OAuthMiddleware, login, login_page
  File "/Users/rayepeng/Documents/code/mysql_mcp_server_pro/src/mysql_mcp_server_pro/oauth/__init__.py", line 1, in <module>
    from .config import oauth_config
  File "/Users/rayepeng/Documents/code/mysql_mcp_server_pro/src/mysql_mcp_server_pro/oauth/config.py", line 28, in <module>
    oauth_config = OAuthConfig() 
                   ^^^^^^^^^^^^^
  File "/Users/rayepeng/Documents/code/mysql_mcp_server_pro/.venv/lib/python3.11/site-packages/pydantic_settings/main.py", line 193, in __init__
    super().__init__(
  File "/Users/rayepeng/Documents/code/mysql_mcp_server_pro/.venv/lib/python3.11/site-packages/pydantic/main.py", line 250, in __init__
    validated_self = self.__pydantic_validator__.validate_python(data, self_instance=self)
                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
pydantic_core._pydantic_core.ValidationError: 6 validation errors for OAuthConfig
MYSQL_HOST
  Extra inputs are not permitted [type=extra_forbidden, input_value='127.0.0.1', input_type=str]
    For further information visit https://errors.pydantic.dev/2.12/v/extra_forbidden
MYSQL_PORT
  Extra inputs are not permitted [type=extra_forbidden, input_value='3306', input_type=str]
    For further information visit https://errors.pydantic.dev/2.12/v/extra_forbidden
MYSQL_USER
  Extra inputs are not permitted [type=extra_forbidden, input_value='root', input_type=str]
    For further information visit https://errors.pydantic.dev/2.12/v/extra_forbidden
MYSQL_PASSWORD
  Extra inputs are not permitted [type=extra_forbidden, input_value='123456', input_type=str]
    For further information visit https://errors.pydantic.dev/2.12/v/extra_forbidden
MYSQL_DATABASE
  Extra inputs are not permitted [type=extra_forbidden, input_value='information_schema', input_type=str]
    For further information visit https://errors.pydantic.dev/2.12/v/extra_forbidden
MYSQL_ROLE
  Extra inputs are not permitted [type=extra_forbidden, input_value='admin', input_type=str]
    For further information visit https://errors.pydantic.dev/2.12/v/extra_forbidden
```

## 使用体验

非常方便，这样对于开发后端的web应用来说会更加方便了


![](https://picgo-1258058044.cos.ap-chengdu.myqcloud.com/img/20251029125938.png)


## 抓包测试

好奇这里是怎么实现的数据通信，抓包测试下

最简单的抓包就是转发本地端口

```bash
socat -v -x TCP-LISTEN:8081,fork TCP:localhost:3000
```

这是把本地的8081端口转发到3000，记得修改下mcp.json里的配置(因为这个mcp用的是HTTP streamable通信)

```json
"mysql_mcp_server_pro": {
  "name": "mysql_mcp_server_pro",
  "type": "streamableHttp",
  "description": "",
  "isActive": true,
  "url": "http://localhost:8081/mcp/"
},
```

> 改端口就行了，路径会自动带上，非常有意思



ping数据包

![](https://picgo-1258058044.cos.ap-chengdu.myqcloud.com/img/202510291301522.png)


执行mysql命令 use demo_db

![](https://picgo-1258058044.cos.ap-chengdu.myqcloud.com/img/202510291301557.png)


执行 execute_sql 

![](https://picgo-1258058044.cos.ap-chengdu.myqcloud.com/img/202510291301076.png)


## 参考

这里的抓包比较直观，可以用用里面的工具
[从抓包看 MCP：AI 工具调用背后的通信机制](https://www.51cto.com/article/814303.html)


## 想法

既然这样，那完全就可以打造多个agent之间的联合，输入一个任务，背后自动调用各种mcp工具解决问题

这背后依赖的是一个客户端？ 还是什么，我想开发一个网页，然后能够调用这个sse的 mcp tool

现在研究的都还是mcp server，mcp client还需要进一步研究：


那就又是另一个事情了
