---
title: 'ucore实验1'
date: 2019-01-01
category: '操作系统'
tags: []
lang: 'zh'
draft: true
---
## 调试基本知识
`qemu -S -s -d in_asm -monitor stdio -hda`
就可以让qemu进入调试状态
然后另一个窗口打开gdb
```
file bin/kernel
target remote :1234
set architecture i8086
b *0x7c00
continue
x /2i $pc
```

## 如何生成ucore.img

Makefile中的写法：
```
$(UCOREIMG): $(kernel) $(bootblock)
    $(V)dd if=/dev/zero of=$@ count=10000
    $(V)dd if=$(bootblock) of=$@ conv=notrunc
    $(V)dd if=$(kernel) of=$@ seek=1 conv=notrunc

$(call create_target,ucore.img)
```
首先先创建一个大小为10000字节的块儿，然后再将bootblock拷贝过去。
生成ucore.img需要先生成kernel和bootblock

生成kernel
```
$(kernel): tools/kernel.ld
$(kernel): $(KOBJS)
    @echo "bbbbbbbbbbbbbbbbbbbbbb$(KOBJS)"
    @echo + ld $@
    $(V)$(LD) $(LDFLAGS) -T tools/kernel.ld -o $@ $(KOBJS)
    @$(OBJDUMP) -S $@ > $(call asmfile,kernel)
    @$(OBJDUMP) -t $@ | $(SED) '1,/SYMBOL TABLE/d; s/ .* / /; /^$$/d' > $(call symfile,kernel)
```

## 参考
[https://blog.csdn.net/qq_19876131/article/details/51706973](https://blog.csdn.net/qq_19876131/article/details/51706973)
