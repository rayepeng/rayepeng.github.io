---
title: protobuf编码规则分析
published: 2025-11-03T13:35:10+08:00
description: ''
customSlug: 'pb-rule-analysis'
image: 'https://picgo-1258058044.cos.ap-chengdu.myqcloud.com/img/protobuf.png'
tags: ['protobuf','逆向']
category: '编程'
draft: false
lang: ''
---



## 分析protobuf二进制编码



比如一个最简单的pb：



```protobuf
syntax = "proto3";

message ResourceModify {
    int32 type = 1;
    int32 amount = 2;
}
```



我们假设数据是：

```json
{
  "type": 1,
  "amount": 26526
}
```



如何得到其对应的二进制编码呢？



### tag + value

可以简单的把pb的二进制编码看作是 tag + value ，首先看tag怎么计算



公式：



```
tag = (field_number << 3) | wire_type
```



`field_num` 即是序号， 左移三位，然后和`wire_type`计算或



这个`wire_type`即代表了该字段的类型，定义如下



![image-20251103210638320](https://picgo-1258058044.cos.ap-chengdu.myqcloud.com/img/image-20251103210638320.png)



因此，第一个字段 `type = 1` 对应的key就是：



```
1 << 3 | 0 = 0x8
```



接着再拼接上它的value，最后就是0x0801



### msb +小端序编码



接着看第二字段



```
"amount": 26526
```



计算tag：`2 <<3 |0 = 0x10` 



对应的value，则是：`9ecf01` ，你是不是很好奇怎么来的，为什么不直接是26526的十六进制编码，这是因为pb采用了msb +小端序的规则

> msb即最高位置作为符号位信息

我们将其转为对应的二进制，第一位为msb符号位直接去掉，然后按照小端序来拼接

```
9e = 10011110
cf = 11001111
01 = 00000001

拼接过程， 先取01 -> 00000001 （注意MSB，第一位直接丢掉
然后取 cf -> 1001111(同样第一位被丢掉了)
再取 9e -> 0011110 
拼接起来就成了  1 1001111 0011110
用py代码转一下就有了
int('1 1001111 0011110'.replace(' ', ''), 2) # 26526
```



vibe coding一下



```python
def int_to_varint(n):
    """
    将一个大于 255 的整数转换为 Protobuf varint 编码。

    :param n: 需要转换的整数。
    :return: varint 编码后的字节数组（以 list 的形式返回）。
    """
    result = []
    while n > 0x7F:  # 0x7F = 127
        # 取低 7 位，并将高位设为 1 表示后续还有字节
        result.append((n & 0x7F) | 0x80)
        n >>= 7  # 将 n 右移 7 位
    result.append(n & 0x7F)  # 最后一个字节，最高位为 0
    return result

# 示例：将一
# 个大于 255 的数转换为 varint 编码
number = 26581
varint_encoded = int_to_varint(number)
print(f"Varint encoding for {number}: {[hex(b) for b in varint_encoded]}")
```



### 嵌套消息结构



如果遇到了这段编码 



```
0A 06 08 01 10 9E CF 01
```



可以看到就是多了前两个字节： `0A 06`

其中 0A 是第一个字段，并且代表后面是一个字符串或者嵌套消息，06代表长度，接着后面刚好6个字节， 08 01 10 9E CF 01，其实就回到前面了，所以其消息结构应该是：



```json
{
  "1": {
    "1": 1,
    "2": 26526
  }
}
```



## 一键解码pb二进制

可以直接调用 `protoc --decode_raw` 来解码，不过pb编码后会丢失字段名，所以解码后也是看不到字段名的



```bash
❯ echo "0A 06 08 01 10 9E CF 01" | xxd -r -p | protoc --decode_raw

1 {
  1: 1
  2: 26526
}
```



或者这个例子：



```bash
❯ echo "0a1074645f6f70656e65775f64616d656e67120864616d656e6777781a08313139373230363922a0017b226f70656e6964223a226f33396867347a5155484b47376f414b57316655384b39425674426f222c22746f6b656e223a226a6434747165564664484b4c65366b31576d4a346550427875565137564e6e724c6c55413847442f6a5a2b4e3636535464655039534c37556936666a6176676a67714b735378646d61396d62644a6d2f6634615352517646415a414f50545578414c6b49664961513776513d227d2a00320864616d656e6777783a140a0012001a0022002a0032003a0631342e322e304202636e4804" | xxd -r -p  | protoc --decode_raw
1: "td_openew_dameng"
2: "damengwx"
3: "11972069"
4: "{\"openid\":\"o39hg4zQUHKG7oAKW1fU8K9BVtBo\",\"token\":\"jd4tqeVFdHKLe6k1WmJ4ePBxuVQ7VNnrLlUA8GD/jZ+N66STdeP9SL7Ui6fjavgjgqKsSxdma9mbdJm/f4aSRQvFAZAOPTUxALkIfIaQ7vQ=\"}"
5: ""
6: "damengwx"
7 {
  1: ""
  2: ""
  3: ""
  4: ""
  5: ""
  6: ""
  7: "14.2.0"
}
8: "cn"
9: 4
```



## 一键编码pb二进制

`protoc` 提供了解码，但是并没有提供编码，这个让我百思不得其解，实战中经常会有需要解码后修改数据再编码回去的，这个过程是完全可逆的，不会损失任何信息



于是干脆自己vibe coding了一个，如下，非常方便



```python
'''
python pb_test.py # 解码，默认输出到output.txt
python pb_test.py encode # 编码，默认读取output.txt
'''

from google.protobuf.internal import decoder, encoder
import base64
import struct

# 在这里粘贴base64编码的pb二进制数据
a = '''CA8SyQEIARABGAAgACgAMAA4AEAASABQAFgAYABoAHC+T3gAgAEAiAEAkAEAmAEAoAEAqAEDsAEAuAEAwgEIAQg2ONAP0Q/IAQDQAdvctKeiM9gBAOABAOgBAPABAPgBAYACAIgC0A+SAgCYAgKgAgCoAgywAgC4AgDAAgDIAgDYAgDgAgDoAgDyAgoIBhAAGAAgASgA+AIAgAMAigMICJvbgMgGIAGSAxUKCAiAi/nHBhAACgkIgK7+xwYQryuaAwYoADABOGSiAwCoAwAaCAix2wYQABgAGggIstsGEAAYABoICLPbBhAAGAAaCAi02wYQABgAIgYIwZoMEAAiCgihjQYQgNKTrQMiCgiijQYQgNKTrQMqvQcKIwgBEAEYASABKgIBBTC7gMHGojM4AEAASABQAGAAaABwAHgBEgMI8AcaAghlKgwIoY0GEGUYACAAKAA6DQiRThBlGAEgACgAMAA6DQiSThBkGAAgACgAMAM6DQiTThBkGAAgACgAMANCDAihnAEQZBgAIAAoAEIMCKKcARBkGAAgACgAQgwIo5wBEGQYACAAKABCDAiknAEQZBgAIAAoAEIMCKWcARBkGAAgACgAQgwIppwBEGQYACAAKABCDAipnAEQZRgBIAAoAEoMCLHqARBlGAEgACgAUg4IwbgCEGQYACAAKAAwBFoICNGGAxBlGABiCAjh1AMQZRgBaggI8aIEEGUYAXIMCIHxBBBlGAEgACgAegoIkb8FEGQYACAAggEECAEQAIIBBAgCEACCAQQIAxAAggEECAQQAIIBBAgFEACCAQQIBhAAggEECAcQAIIBBAgIEACCAQQICRAAigEMCLHbBhBkGAAgACgAigEMCLLbBhBkGAAgACgAigEMCLPbBhBkGAAgACgAkgEMCMGpBxBkGAAgACgAmgEMCOHFCBBkGAAgACgAmgEMCOLFCBBkGAAgACgAmgEMCOPFCBBkGAAgACgAmgEMCOTFCBBkGAAgACgAmgEMCOXFCBBkGAAgACgAmgEMCObFCBBkGAAgACgAmgEMCOfFCBBkGAAgACgAmgEMCOjFCBBkGAAgACgAmgEMCOnFCBBkGAAgACgAqgEMCIHiCRBkGAAgACgAqgEMCILiCRBkGAAgACgAqgEMCIPiCRBkGAAgACgAsgEOCJOwChBkGAAgACgAMAKyAQ4IkrAKEGQYACAAKAAwArIBDgiRsAoQZBgAIAAoADACugEICKH+ChBlGADCAQwIscwLEGQYACAAKADCAQwIsswLEGQYACAAKADCAQwIs8wLEGQYACAAKADCAQwItMwLEGQYACAAKADKAQgIwZoMEGQYANIBDAjU6AwQZBgAIAAoANIBDAjR6AwQZBgAIAAoANIBDAjS6AwQZBgAIAAoANIBDAjT6AwQZBgAIAAoAOIBDAjxhA4QZBgAIAAoAOIBDAjyhA4QZBgAIAAoAOIBDAjzhA4QZBgAIAAoAOIBDAj0hA4QZBgAIAAoAOoBDgiB0w4QZBgAIAAoADAD6gEOCILTDhBkGAAgACgAMAPyAQwI4ZgXEGQYACAAKAD6AQwIgbUYEGQYACAAKACCAgwI8eYXEGQYACAAKACKAh4IARACGAAgACgAMgA6AEIASABQAFgAYABoAHAAeAEyADoKCAEQy+qAyAYqAEIA'''

# base64解码
data = base64.b64decode(a)

def is_valid_utf8(data):
    """检查数据是否为有效的UTF-8字符串"""
    try:
        data.decode('utf-8')
        return True
    except:
        return False

def parse_message(data, depth=0):
    """
    完整解析 protobuf message，支持所有wire types
    返回 list of (field_number, value)，保留重复字段
    """
    pos = 0
    result = []
    while pos < len(data):
        try:
            key, pos = decoder._DecodeVarint(data, pos)
        except:
            break
            
        field_number = key >> 3
        wire_type = key & 0x7

        if wire_type == 0:  # varint
            value, pos = decoder._DecodeVarint(data, pos)
            result.append((field_number, value))
            
        elif wire_type == 1:  # 64-bit (fixed64, double)
            if pos + 8 > len(data):
                break
            value = struct.unpack('<Q', data[pos:pos+8])[0]
            result.append((field_number, value))
            pos += 8
            
        elif wire_type == 2:  # length-delimited (字符串/bytes/嵌套消息)
            length, pos = decoder._DecodeVarint(data, pos)
            if pos + length > len(data):
                break
            value = data[pos:pos+length]
            
            # 尝试解析为嵌套消息
            try:
                nested = parse_message(value, depth+1)
                if nested and len(nested) > 0:
                    # 如果成功解析出字段，认为是嵌套消息
                    result.append((field_number, nested))
                else:
                    # 否则作为bytes/string
                    result.append((field_number, value))
            except:
                # 解析失败，作为bytes/string
                result.append((field_number, value))
            pos += length
            
        elif wire_type == 5:  # 32-bit (fixed32, float)
            if pos + 4 > len(data):
                break
            value = struct.unpack('<I', data[pos:pos+4])[0]
            result.append((field_number, value))
            pos += 4
            
        else:
            # 不支持的wire type，跳过
            break
            
    return result

def format_bytes(b):
    """格式化bytes为带引号和转义的字符串"""
    result = []
    for byte in b:
        if 32 <= byte <= 126 and byte != ord('\\') and byte != ord('"'):
            # 可打印ASCII字符
            result.append(chr(byte))
        else:
            # 转义表示
            if byte < 8:
                result.append(f'\\{byte:03o}')
            else:
                result.append(f'\\{byte:03o}')
    return '"' + ''.join(result) + '"'

def format_value(value, indent=0):
    """格式化单个值"""
    if isinstance(value, list):
        # 嵌套消息
        lines = []
        lines.append(' ' * indent + '{')
        for field_num, field_val in value:
            field_lines = format_field(field_num, field_val, indent + 2)
            lines.extend(field_lines)
        lines.append(' ' * indent + '}')
        return lines
    elif isinstance(value, bytes):
        # bytes类型，判断是否为空字符串或二进制数据
        if len(value) == 0:
            return [' ' * indent + '""']
        # 检查是否全是可打印字符
        try:
            decoded = value.decode('utf-8')
            # 如果只包含数字字母和一些常见字符，直接显示
            if all(32 <= b <= 126 for b in value):
                return [' ' * indent + f'"{decoded}"']
        except:
            pass
        # 否则使用转义格式
        return [' ' * indent + format_bytes(value)]
    else:
        # 整数
        return [' ' * indent + str(value)]

def format_field(field_num, value, indent=0):
    """格式化字段"""
    lines = []
    if isinstance(value, list):
        # 嵌套消息
        lines.append(' ' * indent + f'{field_num} {{')
        for sub_field_num, sub_value in value:
            sub_lines = format_field(sub_field_num, sub_value, indent + 2)
            lines.extend(sub_lines)
        lines.append(' ' * indent + '}')
    elif isinstance(value, bytes):
        # bytes类型
        if len(value) == 0:
            lines.append(' ' * indent + f'{field_num}: ""')
        else:
            # 尝试解码
            try:
                decoded = value.decode('utf-8')
                if all(32 <= b <= 126 for b in value):
                    lines.append(' ' * indent + f'{field_num}: "{decoded}"')
                else:
                    lines.append(' ' * indent + f'{field_num}: {format_bytes(value)}')
            except:
                lines.append(' ' * indent + f'{field_num}: {format_bytes(value)}')
    else:
        # 整数
        lines.append(' ' * indent + f'{field_num}: {value}')
    return lines

def format_message(parsed_list):
    """格式化整个消息为res1.txt的格式"""
    lines = []
    for field_num, value in parsed_list:
        field_lines = format_field(field_num, value, 0)
        lines.extend(field_lines)
    return '\n'.join(lines)

def parse_escaped_string(s):
    """解析带转义的字符串，返回bytes"""
    if not s.startswith('"') or not s.endswith('"'):
        raise ValueError(f"字符串必须以引号包围: {s}")
    
    s = s[1:-1]  # 去掉首尾引号
    result = []
    i = 0
    while i < len(s):
        if s[i] == '\\' and i + 3 < len(s):
            # 八进制转义 \xxx
            try:
                octal = s[i+1:i+4]
                byte_val = int(octal, 8)
                result.append(byte_val)
                i += 4
            except:
                result.append(ord(s[i]))
                i += 1
        else:
            result.append(ord(s[i]))
            i += 1
    return bytes(result)

def parse_text_format(lines):
    """
    从文本格式解析回数据结构
    返回 list of (field_number, value)
    """
    result = []
    i = 0
    
    while i < len(lines):
        line = lines[i].rstrip()
        if not line or line.isspace():
            i += 1
            continue
        
        # 计算缩进
        indent = len(line) - len(line.lstrip())
        line = line.strip()
        
        if line == '}':
            # 消息结束
            break
        elif ':' in line and not line.endswith('{'):
            # 字段: 值
            field_str, value_str = line.split(':', 1)
            field_num = int(field_str.strip())
            value_str = value_str.strip()
            
            if value_str.startswith('"'):
                # 字符串/bytes值
                value = parse_escaped_string(value_str)
            else:
                # 整数值
                value = int(value_str)
            
            result.append((field_num, value))
            i += 1
        elif line.endswith('{'):
            # 嵌套消息开始
            field_str = line[:-1].strip()
            field_num = int(field_str)
            
            # 找到匹配的结束括号
            bracket_count = 1
            j = i + 1
            start_line = j
            while j < len(lines) and bracket_count > 0:
                sub_line = lines[j].strip()
                if sub_line.endswith('{'):
                    bracket_count += 1
                elif sub_line == '}':
                    bracket_count -= 1
                j += 1
            
            # 递归解析嵌套消息
            nested_lines = lines[start_line:j-1]
            nested_value = parse_text_format(nested_lines)
            result.append((field_num, nested_value))
            i = j
        else:
            i += 1
    
    return result

def encode_message(parsed_list):
    """
    将解析后的list编码回protobuf二进制
    """
    parts = []
    for field_number, value in parsed_list:
        if isinstance(value, int):  # varint
            key = (field_number << 3) | 0
            parts.append(encoder._VarintBytes(key))
            parts.append(encoder._VarintBytes(value))
        elif isinstance(value, list):  # 嵌套消息
            key = (field_number << 3) | 2
            nested_bytes = encode_message(value)
            parts.append(encoder._VarintBytes(key))
            parts.append(encoder._VarintBytes(len(nested_bytes)))
            parts.append(nested_bytes)
        elif isinstance(value, bytes):
            key = (field_number << 3) | 2
            parts.append(encoder._VarintBytes(key))
            parts.append(encoder._VarintBytes(len(value)))
            parts.append(value)
        else:
            raise TypeError(f"不支持的类型: {type(value)}")
    return b''.join(parts)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'encode':
        # 反向模式：从文本文件编码回base64
        input_file = sys.argv[2] if len(sys.argv) > 2 else 'output.txt'
        
        print(f"正在从 {input_file} 读取并编码...")
        with open(input_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # 解析文本格式
        parsed = parse_text_format(lines)
        
        # 编码回二进制
        encoded_data = encode_message(parsed)
        
        # base64编码
        b64_result = base64.b64encode(encoded_data).decode('ascii')
        
        print("\n编码结果（base64）:")
        print(b64_result)
        print(f"\n原始长度: {len(data)} bytes")
        print(f"编码长度: {len(encoded_data)} bytes")
        print(f"是否匹配: {encoded_data == data}")
        
        # 保存到文件
        with open('encoded_result.txt', 'w') as f:
            f.write(b64_result)
        print(f"\n已保存到 encoded_result.txt")
        
    else:
        # 正常模式：解析base64并输出文本
        print("正在解析protobuf数据...")
        msg = parse_message(data)
        
        # 格式化输出
        formatted = format_message(msg)
        print(formatted)
        
        # 保存到文件
        with open('output1.txt', 'w', encoding='utf-8') as f:
            f.write(formatted + '\n')
        print("\n已保存到 output.txt")
        
        # 验证：编码回去看是否一致
        print("\n验证：重新编码...")
        re_encoded = encode_message(msg)
        print(f"原始数据: {len(data)} bytes")
        print(f"重新编码: {len(re_encoded)} bytes")
        print(f"数据一致: {re_encoded == data}")
        
        if re_encoded == data:
            print("✅ 编码解码完全可逆！")
        else:
            print("❌ 数据不一致")
            # 找出差异
            for i, (a, b) in enumerate(zip(data, re_encoded)):
                if a != b:
                    print(f"第一个差异在位置 {i}: 原始={a:02x}, 重编码={b:02x}")
                    break
```









