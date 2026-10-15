---
title: 'v2ray学习'
date: 2019-08-15
category: 'note'
tags:
  - 'v2ray'
lang: 'zh'
draft: false
---
> V2Ray 使用 inbound(传入) 和 outbound(传出) 的结构，这样的结构非常清晰地体现了数据包的流动方向，同时也使得 V2Ray 功能强大复杂的同时而不混乱，清晰明了。形象地说，我们可以把 V2Ray 当作一个盒子，这个盒子有入口和出口(即 inbound 和 outbound)，我们将数据包通过某个入口放进这个盒子里，然后这个盒子以某种机制（这个机制其实就是路由，后面会讲到）决定这个数据包从哪个出口吐出来。以这样的角度理解的话，V2Ray 做客户端，则 inbound 接收来自浏览器数据，由 outbound 发出去(通常是发到 V2Ray 服务器)；V2Ray 做服务器，则 inbound 接收来自 V2Ray 客户端的数据，由 outbound 发出去(通常是如 Google 等想要访问的目标网站)。

v2ray的工作原理：

客户端：

假设客户端配置inbounds，post为1080，协议是socks。首先需要在浏览器中设置代理sock host:127.0.0.1 port 1080

如果访问google.com 那么浏览器的数据包会发送到本机的1080端口，这个时候数据包被本机的v2ray客户端收到

再看outbounds。协议是vmess，v2ray客户端接收到数据包之后打包成vmess的格式并且用预设的id加密，然后发送到服务器地址xxxx，端口pppp

所以如下的配置大概就能理解了：

客户端：

```

{
  "inbounds": [
    {
      "port": 1080, // 监听端口
      "protocol": "socks", // 入口协议为 SOCKS 5
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth"  //socks的认证设置，noauth 代表不认证，由于 socks 通常在客户端使用，所以这里不认证
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "vmess", // 出口协议
      "settings": {
        "vnext": [
          {
            "address": "serveraddr.com", // 服务器地址，请修改为你自己的服务器 IP 或域名
            "port": 16823,  // 服务器端口
            "users": [
              {
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  // 用户 ID，必须与服务器端配置相同
                "alterId": 64 // 此处的值也应当与服务器相同
              }
            ]
          }
        ]
      }
    }
  ]
}
```

浏览器—->本机的v2ray—->vps监听的端口

服务端配置：

```
{
  "inbounds": [
    {
      "port": 16823, // 服务器监听端口
      "protocol": "vmess",    // 主传入协议
      "settings": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  // 用户 ID，客户端与服务器必须相同
            "alterId": 64
          }
        ]
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",  // 主传出协议
      "settings": {}
    }
  ]
}
```

在客户端配置的 inbounds 中，有一个 “sniffing” 字段，V2Ray 手册解释为“流量探测，根据指定的流量类型，重置所请求的目标”，这话不太好理解，简单说这东西就是从网络流量中识别出域名。这个 sniffing 有两个用处：

1.  解决 DNS 污染；
2.  对于 IP 流量可以应用后文提到的域名路由规则；
3.  识别 BT 协议，根据自己的需要拦截或者直连 BT 流量

接着看服务器，服务器配置的 id 是 b831381d-6324-4d53-ad4f-8cda48b30811，所以 V2Ray 服务器接收到客户端发来的数据包时就会尝试用 b831381d-6324-4d53-ad4f-8cda48b30811 解密，如果解密成功再看一下时间对不对，对的话就把数据包发到 outbound 去，outbound.protocol 是 freedom（freedom 的中文意思是自由，在这里姑且将它理解成直连吧），数据包就直接发到 google.com 了。

## 参考

[v2ray配置指南](https://guide.v2fly.org/basics/vmess.html#配置前的准备)
