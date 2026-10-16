---
title: '回归，用tensorflow预测燃油效率'
date: 2019-01-01
category: 'tensorflow'
tags: []
lang: 'zh'
draft: true
---
#### 基础知识
1. pandas.read_csv()参数解析

`filepath_or_buffer`: str，pathlib。str, pathlib.Path, py._path.local.LocalPath or any object with a read() method (such as a file handle or StringIO)
可以是URL，可用URL类型包括：http, ftp, s3和文件。对于多文件正在准备中
本地文件读取实例：://localhost/path/to/table.csv

`names`: array-like, default None
用于结果的列名列表，如果数据文件中没有列标题行，就需要执行header=None。默认列表中不能出现重复，除非设定参数mangle_dupe_cols=True。

`na_values` : scalar, str, list-like, or dict, default None
一组用于替换NA/NaN的值。如果传参，需要制定特定列的空值。默认为‘1.#IND’, ‘1.#QNAN’, ‘N/A’, ‘NA’, ‘NULL’, ‘NaN’, ‘nan’`.

`comment`: str, default None
标识着多余的行不被解析。如果该字符出现在行首，这一行将被全部忽略。这个参数只能是一个字符，空行（就像skip_blank_lines=True）注释行被header和skiprows忽略一样。例如如果指定comment='#' 解析‘#empty\na,b,c\n1,2,3’ 以header=0 那么返回结果将是以’a,b,c'作为header。

`sep`: str, default ‘,’
指定分隔符。如果不指定参数，则会尝试使用逗号分隔。分隔符长于一个字符并且不是‘\s+’,将使用python的语法分析器。并且忽略数据中的逗号。正则表达式例子：'\r\t'

`skipinitialspace`: boolean, default False
忽略分隔符后的空白（默认为False，即不忽略）.
