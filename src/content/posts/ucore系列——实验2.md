---
title: 'ucore系列——实验2'
date: 2019-01-01
category: '操作系统'
tags: []
lang: 'zh'
draft: true
---
需要修改的地方

![](https://upload-images.jianshu.io/upload_images/10651191-2fd0d4acd94f06bf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

需要重写以下函数
`default_init`, `default_init_memmap` 和 `default_alloc_pages`， `default_free_pages`
从名字上来看
分别是初始化， 初始化内存映射， 分配， 回收

首先需要熟悉`area_t`这个结构
它是用来管理空闲内存块的， 在`list.h`这个文件中， 使用一个链表实现的

![](https://upload-images.jianshu.io/upload_images/10651191-7b997fb7253fe97f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# list.h

![](https://upload-images.jianshu.io/upload_images/10651191-9a78642073fa9453.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![函数声明](https://upload-images.jianshu.io/upload_images/10651191-4ab52564752afaee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

mdzz不知道直接在sublime里面看

# pmm.c相关结构

这个是 `taskstate`的结构， 从名字上看认为是任务状态

```
/* task state segment format (as described by the Pentium architecture book) */
struct taskstate {
    uint32_t ts_link;       // old ts selector
    uintptr_t ts_esp0;      // stack pointers and segment selectors
    uint16_t ts_ss0;        // after an increase in privilege level
    uint16_t ts_padding1;
    uintptr_t ts_esp1;
    uint16_t ts_ss1;
    uint16_t ts_padding2;
    uintptr_t ts_esp2;
    uint16_t ts_ss2;
    uint16_t ts_padding3;
    uintptr_t ts_cr3;       // page directory base
    uintptr_t ts_eip;       // saved state from last task switch
    uint32_t ts_eflags;
    uint32_t ts_eax;        // more saved state (registers)
    uint32_t ts_ecx;
    uint32_t ts_edx;
    uint32_t ts_ebx;
    uintptr_t ts_esp;
    uintptr_t ts_ebp;
    uint32_t ts_esi;
    uint32_t ts_edi;
    uint16_t ts_es;         // even more saved state (segment selectors)
    uint16_t ts_padding4;
    uint16_t ts_cs;
    uint16_t ts_padding5;
    uint16_t ts_ss;
    uint16_t ts_padding6;
    uint16_t ts_ds;
    uint16_t ts_padding7;
    uint16_t ts_fs;
    uint16_t ts_padding8;
    uint16_t ts_gs;
    uint16_t ts_padding9;
    uint16_t ts_ldt;
    uint16_t ts_padding10;
    uint16_t ts_t;          // trap on task switch
    uint16_t ts_iomb;       // i/o map base address
} __attribute__((packed));

```
## 这是页的结构

![](https://upload-images.jianshu.io/upload_images/10651191-07e20bbb7348990e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
struct list_entry {
    struct list_entry *prev, *next;
};

typedef struct list_entry list_entry_t;
```

记一下 `list_entry_t` 就是两个指针的结构体

这几个页号 也就是pde啥的
![](https://upload-images.jianshu.io/upload_images/10651191-915ed188e66a1b53.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## pmm_manager结构

大致有名字， 初始化， 分配， 释放检查等函数

```
struct pmm_manager {
    const char *name;                                 // XXX_pmm_manager's name
    void (*init)(void);                               // initialize internal description&management data structure
                                                      // (free block list, number of free block) of XXX_pmm_manager 
    void (*init_memmap)(struct Page *base, size_t n); // setup description&management data structcure according to
                                                      // the initial free physical memory space 
    struct Page *(*alloc_pages)(size_t n);            // allocate >=n pages, depend on the allocation algorithm 
    void (*free_pages)(struct Page *base, size_t n);  // free >=n pages with "base" addr of Page descriptor structures(memlayout.h)
    size_t (*nr_free_pages)(void);                    // return the number of free pages 
    void (*check)(void);                              // check the correctness of XXX_pmm_manager 
};
```

## 段描述符表

```
/* segment descriptors */
struct segdesc {
    unsigned sd_lim_15_0 : 16;      // low bits of segment limit
    unsigned sd_base_15_0 : 16;     // low bits of segment base address
    unsigned sd_base_23_16 : 8;     // middle bits of segment base address
    unsigned sd_type : 4;           // segment type (see STS_ constants)
    unsigned sd_s : 1;              // 0 = system, 1 = application
    unsigned sd_dpl : 2;            // descriptor Privilege Level
    unsigned sd_p : 1;              // present
    unsigned sd_lim_19_16 : 4;      // high bits of segment limit
    unsigned sd_avl : 1;            // unused (available for software use)
    unsigned sd_rsv1 : 1;           // reserved
    unsigned sd_db : 1;             // 0 = 16-bit segment, 1 = 32-bit segment
    unsigned sd_g : 1;              // granularity: limit scaled by 4K when set
    unsigned sd_base_31_24 : 8;     // high bits of segment base address
};
```

# 疑问

1. 还有好多代码看不懂

比如这里的内联汇编

![](https://upload-images.jianshu.io/upload_images/10651191-28aea0a600ca7ab1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
