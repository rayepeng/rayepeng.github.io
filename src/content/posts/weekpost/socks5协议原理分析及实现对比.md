---
title: socks5协议原理分析及实现对比
published: 2023-04-10
description: ''
image: ''
tags: []
category: '编程'
draft: false
lang: ''
---
 socks5协议原理分析及实现对比


<!-- ![scoks5xieyi](./attachments/QmQYVJ5LrzJoGnb91Ch5vV5PWCWcFDiWP4nAFjB2HfPXUu.png) -->


 socks5隧道原理


其实我们经常在fq的时候用到socks协议，但对于其工作原理一直没有很清晰，趁着周末捋了一下

**首先什么是网络隧道？**

各种百科上给出的定义整理如下：

网络隧道是在现有的网络协议之上建立的一个新的虚拟网络连接。通过在一个网络协议中封装另一个网络协议的数据包，从而实现数据在不同网络之间的传输。这种方式可以将数据在公共网络（例如互联网）上的传输与私有网络或其他网络保持隔离，从而提高数据传输的安全性。

但是这个定义太难理解，于是我开始思考为什么要叫隧道呢？

类比我们日常中见到的隧道，比如火车山谷隧道，点A到点B有一座大山，于是挖了一条A到B的隧道，这条隧道可以允许火车等车辆通过

那么类比到网络协议中，点A到点B由于某种原因无法直接通信（原因dddd），于是我们在A和B之间打一条隧道（socks5协议），然后把我们的火车（HTTP数据，毕竟我们上网也就是HTTP通信）从这条隧道传输过去

这样是不是就很容易理解socks网络隧道了！我真是个小机灵鬼




类似的在安全渗透中还有一种HTTP隧道，即将利用HTTP协议的某些特性（如chunked），建立一条HTTP隧道，传输HTTP通信数据（禁止套娃/doge) ，不过这是后话了，本文只研究socks网络隧道

<!-- ![Untitled](./attachments/bafkreidhmwcilj65gxilxqcpyfr6hbswcguykr6vqpqypzx563y2jixmpi.png) -->

从上述的类比中可以看到，**socks网络隧道建立的条件如下：**

- 目的地，即socks代理需要连接的目标
- 施工队 即socks代理服务器

也就是说，客户端A需要有一个施工队，并且告诉施工队我要去哪，施工队才会给你挖一条隧道

最后放一个socks5隧道的定义吧，类比过来是不是觉得好理解多了

SOCKS5 隧道是一种网络协议隧道，用于在客户端和目标服务器之间传输数据。SOCKS5 是 SOCKS 协议的第五个版本，它支持多种身份验证方法，以及 IPv4 和 IPv6 地址。SOCKS5 隧道允许在其上运行各种协议（如 HTTP、FTP、SMTP 等），并在客户端和目标服务器之间提供中间代理服务。

SOCKS5 隧道的工作原理是在客户端和目标服务器之间建立一个代理服务器。客户端不直接与目标服务器通信，而是将数据发送到 SOCKS5 代理。SOCKS5 代理接收数据，然后将其转发到目标服务器。目标服务器将响应发送回 SOCKS5 代理，代理再将响应转发给客户端。

SOCKS5 隧道的主要优点是提供了一种通用的网络代理解决方案，支持多种协议和地址类型。这使得 SOCKS5 隧道可以用于绕过防火墙和内容过滤器，实现对受限网络资源的访问。

********************************************实现一个socks代理服务********************************************

这里我们选择go和rust来对比实现下socks5代理服务器，即隧道的施工队，并且简单对比下性能，看看rust和go在socks5代理这块的性能孰强孰弱

 TCP 代理server实现

我们先来看看一个通用的TCP的server咋搞，这里是通信数据的传递示意图：

```rust
+-----------+       +--------------+       +--------------+
|  Browser  | <---> | TCP Proxy    | <---> | Target Server|
+-----------+       +--------------+       +--------------+
```

注意，TCP Proxy 本质上只是接收TCP数据并转发处理的，所以实际上socks5的请求发起方是浏览器，这也就是为什么我们通常要安装一个chrome插件（比如proxy switchy omega）来选择代理方式了

在`golang`中，实现一个代理服务器很简单，只需要 `net.Listen` 即可开启一个端口，开启端口后的server只需要不断地 `Accept` ，每来一个就开一个 `goroutine`


<!-- ![Untitled 1](./attachments/bafkreiebmqlggjfcuvbsyjhprnww5vfrk2d4nsizswd4l4643xvff7yd2e.png) -->

```go
func main() {
	server, err := net.Listen("tcp", ":1081")
	if err != nil {
		fmt.Printf("Listen failed: %v\n", err)
		return
	}

	for {
		client, err := server.Accept()
		if err != nil {
			fmt.Printf("Accept failed: %v", err)
			continue
		}
		go process(client)
	}
}
```

这个client中就同时包含了浏览器发送给我们的请求，以及暴露写接口供我们写入响应数据

对应到rust中，也有一个类似goroutine的实现，tokio，实现异步的IO任务，基本代码如下：

```rust
[tokio::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:1080").await.unwrap();
    loop {
        let (client, _) = listener.accept().await.unwrap();
        spawn(handle_client(client));
    }
}
```

注意socks5代理最常用的端口是1080，如果想要在wireshark中抓包查看，wireshark只能解析1080端口的socks5通信

 实现socks5代理

socks5协议本质上还是个应用层协议，数据会被打包到TCP 数据包的 payload中，sock5协议类比挖隧道可以分为几个部分，

- `socks5auth` 先找到施工队
- `socks5connect` 开始挖隧道
- `socks5forward` 隧道通车了！

`socks5forward` 即进入隧道通行阶段，这个阶段已经没有socks5参与了，因为隧道已经挖完了，就让HTTP数据包自由的驰骋吧！



<!-- ![Untitled 2](./attachments/bafkreidb75fc2zvvjlmyaxyohnx66d5czvr2kiq4yvhj4lt3d5kdgohbaq.png) -->

<!-- ![Untitled 5](./attachments/bafybeibh4ylvhtjv6hiyebsrgnp7znutab37b3yxwwmr5ua3opwre6wu4m.png.png) -->


 socks5auth 先找到施工队

socks5协议是由客户端先发起的：

```bash
 客户端发送
+----+----------+----------+
|VER | NMETHODS | METHODS  |
+----+----------+----------+
| 1  |    1     | 1 to 255 |
+----+----------+----------+

 服务器响应
+----+--------+
|VER | METHOD |
+----+--------+
| 1  |   1    |
+----+--------+
```

具体字段如下：

客户端请求

- VER 版本号 1字节
- NMETHODS 可供选的认证方法，1字节
- METHODS (长度等于NMETHODS) 一个字节一个方法

服务端返回

- VER 版本号
- METHOD 认证方法，我们直接无认证梭哈，填0x00

因此第一步就只需读取请求，然后返回 `0x05,0x00` 给客户端表示同意连接

```go
func Socks5Auth(client net.Conn) (err error) {
	buf := make([]byte, 256)

	// 读取 VER 和 NMETHODS
	n, err := io.ReadFull(client, buf[:2])

	ver, nMethods := int(buf[0]), int(buf[1])

	// 读取 METHODS 列表
	n, err = io.ReadFull(client, buf[:nMethods])

	//无需认证
	n, err = client.Write([]byte{0x05, 0x00})

	return nil
}
```

同理rust的实现：

```rust
async fn socks5_auth(client: &mut TcpStream) -> Result<(), Box<dyn std::error::Error>> {
    let mut buf = [0u8; 2]; // 初始化为[0,0]
    client.read_exact(&mut buf).await?;
    let ver = buf[0];
    let n_methods = buf[1];

    let mut methods = vec![0u8; n_methods as usize];
    client.read_exact(&mut methods).await?;

    client.write_all(&[0x05, 0x00]).await?;

    Ok(())
}
```

这样，socks5协议的第一步，施工队已经找到了，并且告诉客户端我来帮你挖隧道！

 socks5connect 开始挖隧道


<!-- ![Untitled 3](./attachments/bafkreidh5dssndg7cgvluivaueijl42ou7ghe43zl5av7tw23eawcnp27i.png) -->


协议细节如下（数字表示字节长度）：

```rust

 客户端发送
+----+-----+-------+------+----------+----------+
|VER | CMD |  RSV  | ATYP | DST.ADDR | DST.PORT |
+----+-----+-------+------+----------+----------+
| 1  |  1  | X'00' |  1   | Variable |    2     |
+----+-----+-------+------+----------+----------+

 服务端响应
+----+-----+-------+------+----------+----------+
|VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
+----+-----+-------+------+----------+----------+
| 1  |  1  | X'00' |  1   | Variable |    2     |
+----+-----+-------+------+----------+----------+
```

客户端请求：

- VER 版本号 1字节，默认为5
- CMD 0x01 表示连接
- RSV 保留固定位0x00
- ATYP 请求类型，0x01为ipv4，0x03为域名，0x04为ipv6
- DST.ADDR 地址，如果请求为域名，第一个字节为域名长度，否则4字节ipv4地址（ipv6就不管了）
- DST.PORT 端口 2字节

服务端响应：

- VER 版本号 1字节，默认为5
- REP 确认回应 0x00 succeed
- RSV 保留，默认0

后面几个字段只适用于客户端BIND命令（不是我们用到的connect命令），都传0就行了

- ATYP 响应类型，0x01 表示ipv4，0x03表示域名，0x04表示ipv6
- BND.ADDR 地址
- BND.PORT 端口

既然这一步是挖隧道，那就要知道客户端让我们挖通往哪里的隧道，所以这里其实就分成两步

- 解析出客户端发给我们的目的地（按照上述协议解析）
- 建立通往目的地的TCP连接

客户端 → socks proxy

socks proxy → 客户端的代码就一行，我写在注释里了

```rust
func Socks5Connect(client net.Conn) (net.Conn, error) {
	buf := make([]byte, 256)

	n, err := io.ReadFull(client, buf[:4])

	// 前四个字节
	ver, cmd, _, atyp := buf[0], buf[1], buf[2], buf[3]

	addr := ""
	switch atyp {
	case 1: // 假设只有 第一种ipv4的情况
		n, err = io.ReadFull(client, buf[:4])
		if n != 4 {
			return nil, errors.New("invalid IPv4: " + err.Error())
		}
		addr = fmt.Sprintf("%d.%d.%d.%d", buf[0], buf[1], buf[2], buf[3])
		//  ...

	default:
		return nil, errors.New("invalid atyp")
	}

	// 解析端口，注意字节顺序
	n, err = io.ReadFull(client, buf[:2])

	port := binary.BigEndian.Uint16(buf[:2])

	// 得到目的地地址了！
	destAddrPort := fmt.Sprintf("%s:%d", addr, port)

	// 开始挖隧道
	dest, err := net.Dial("tcp", destAddrPort)

	// 给客户端的响应，隧道已竣工！	
	_, err = client.Write([]byte{0x05, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0})

	return dest, nil
}
```

同理我们用rust实现

```rust
async fn socks5_connect(client: &mut TcpStream) -> Result<TcpStream, Box<dyn std::error::Error>> {
    let mut buf = [0u8; 4];
    client.read_exact(&mut buf).await?;

    let ver = buf[0];
    let cmd = buf[1];
    let atyp = buf[3];

    let target_addr = match atyp {
        1 => {
            let mut addr = [0u8; 4];
            client.read_exact(&mut addr).await?;
            format!("{}.{}.{}.{}", addr[0], addr[1], addr[2], addr[3])
        }
   
        _ => return Err("Invalid atyp".into()),
    };

    let mut port_buf = [0u8; 2];
    client.read_exact(&mut port_buf).await?;
    let port = u16::from_be_bytes(port_buf);

		// 开始挖隧道!
    let target = TcpStream::connect(format!("{}:{}", target_addr, port)).await?;
		
		// 告诉客户端隧道已竣工!
    client
        .write_all(&[0x05, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0])
        .await?;

    Ok(target)
}
```

 socks5forward 隧道通车啦


<!-- ![Untitled 4](./attachments/bafkreiacakhhpanw6hridhbcxz5hig3pjn7qlivxkrzyu2tszqkms3wmwe.png) -->

此时我们就要让客户端的client和远端的target建立连接，等于是把这个隧道拼接起来，怎么说有点类似于詹天佑当年开凿京张铁路隧道时所用的两端并进的策略

在go中，我们直接用 `io.Copy` 去实现

```go
func Socks5Forward(client, target net.Conn) {
	forward := func(src, dest net.Conn) {
		defer src.Close()
		defer dest.Close()
		io.Copy(src, dest)
	}
	go forward(client, target)
	go forward(target, client)
}
```

在rust中，也有类似的API，`tokio::io::copy`

```rust
let (mut cr, mut cw) = client.split();
    let (mut tr, mut tw) = target.split();

    let c_to_t = async {
        match tokio::io::copy(&mut cr, &mut tw).await {
            Ok(_) => {}
            Err(e) => {
                eprintln!("Error forwarding from client to target: {}", e);
            }
        }
    };

    let t_to_c = async {
        match tokio::io::copy(&mut tr, &mut cw).await {
            Ok(_) => {}
            Err(e) => {
                eprintln!("Error forwarding from target to client: {}", e);
            }
        }
    };
```

至此，一条socks5的网络隧道建立完毕，之后就是HTTP数据包（火车）开始驰骋

 wireshark抓包测试

前面已提到过，只有socks工作在1080端口时，wireshark才能正确解析出socks协议

如下图标记处socks的三个过程，具体的数据包细节可自行查看：



<!-- ![Untitled 5](./attachments/bafybeibh4ylvhtjv6hiyebsrgnp7znutab37b3yxwwmr5ua3opwre6wu4m.png.png) -->



 压测对比

这里的压测思路是搞一个http server，然后分别用go和rust实现的socks5 proxy去建立隧道，发起请求，看看实际QPS表现

为了方便就用gin来搞个http server

```go
package main

import "github.com/gin-gonic/gin"

func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.String(200, "pong")
	})
	r.Run(":8082")
}
```

使用这个benchmark工具，可以支持socks5协议

```go
go install github.com/cnlh/benchmark@latest
```

首先测下web server的QPS，m1 mac机器配置比较低，就用100个并发跑10w个请求吧

```bash
❯ benchmark -c 100 -n 100000 http://127.0.0.1:8082/ping -ignore-err
Running 100000 test @ 127.0.0.1:8082 by 100 connections
Request as following format:

GET /ping HTTP/1.1
Host: 127.0.0.1:8082

100000 requests in 4.45s, 11.46MB read, 4.20MB write
Requests/sec: 22464.38
Transfer/sec: 3.52MB
Error(s)    : 0
Percentage of the requests served within a certain time (ms)
    50%				2
    65%				2
    75%				3
    80%				4
    90%				8
    95%				17
    98%				29
    99%				51
   100%				82
```

这里的数据解释如下：

- 4.45s内总共完成了10w次请求
- 平均每秒 22464.38，即QPS为22k
- 最后的一段数据给出了不同时间段内请求的百分比，以及这些百分比所对应的响应时间
    - 50%的请求响应在2ms内
    - 99%的请求响应在51ms内

接下来有请两个施工队上场，首先是go代表的goroutine，可以看到QPS虽然有所下降，但是下降不多，并且请求耗时分布居然更均匀了？

```bash
❯ benchmark -c 100 -n 100000 -proxy socks5://127.0.0.1:1080 http://127.0.0.1:8082/ping -ignore-err
Running 100000 test @ 127.0.0.1:8082 by 100 connections
Request as following format:

GET /ping HTTP/1.1
Host: 127.0.0.1:8082

100000 requests in 4.49s, 11.46MB read, 4.20MB write
Requests/sec: 22295.77
Transfer/sec: 3.49MB
Error(s)    : 0
Percentage of the requests served within a certain time (ms)
    50%				2
    65%				3
    75%				4
    80%				4
    90%				7
    95%				14
    98%				25
    99%				35
   100%				63
```

接下来有请rust选手代表的tokio上场，QPS下降了2k左右，并且请求耗时分布差异更大了

```bash
❯ benchmark -c 100 -n 100000 -proxy socks5://127.0.0.1:1080 http://127.0.0.1:8082/ping -ignore-err
Running 100000 test @ 127.0.0.1:8082 by 100 connections
Request as following format:

GET /ping HTTP/1.1
Host: 127.0.0.1:8082

100000 requests in 4.95s, 11.46MB read, 4.20MB write
Requests/sec: 20218.10
Transfer/sec: 3.17MB
Error(s)    : 0
Percentage of the requests served within a certain time (ms)
    50%				3
    65%				4
    75%				4
    80%				5
    90%				7
    95%				13
    98%				25
    99%				34
   100%				92
```

看来 goroutine 选手终是更胜一筹 
<!-- ![Untitled 6](./attachments/bafkreidfbniyu2gtx54bvrbm574h6c4mj2pmq3jnlrjs6xyyu2bfv742bq.png) -->


参考：

[https://segmentfault.com/a/1190000038247560](https://segmentfault.com/a/1190000038247560) 

[http://www.moye.me/2017/08/03/analyze-socks5-protocol/](http://www.moye.me/2017/08/03/analyze-socks5-protocol/)

[https://zgao.top/奇安信实习五-socks5协议抓包分析/](https://zgao.top/%E5%A5%87%E5%AE%89%E4%BF%A1%E5%AE%9E%E4%B9%A0%E4%BA%94-socks5%E5%8D%8F%E8%AE%AE%E6%8A%93%E5%8C%85%E5%88%86%E6%9E%90/)

[]()