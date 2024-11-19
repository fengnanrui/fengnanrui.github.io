---
layout: post
title:  "Azure VM PageFile 问题修复脚本"
date:   2024-11-18 20:33:00
categories: Powershell
tags: Powershell Azure VM Scripts  
excerpt: 本文介绍了一个用于修复Azure VM部分镜像开机PageFile文件报错的问题，系统内部运行。
---

* content
{:toc}

## 问题背景

中国区部分Azure VM部分Windows镜像开机PageFile文件报错
---
### 方案脚本示例
---
```
# 应用新的页面文件设置
$newPagefile.Put()

# 获取 pagefile.sys 文件的路径
$pagefilePath = "C:\pagefile.sys"

# 使用 dir 命令获取隐藏文件
$file = dir C:\ -Force | Where-Object { $_.Name -eq "pagefile.sys" }

# 检查页面文件是否存在并输出相关信息
if ($file) {
    # 获取文件的最后写入时间
    $lastWriteTime = $file.LastWriteTime

    # 输出页面文件的位置和最后修改时间
    Write-Host "Pagefile 存在于: $($file.FullName)"
    Write-Host "Pagefile 最后修改时间: $lastWriteTime"
} else {
    Write-Host "Pagefile 不存在于指定路径: $pagefilePath"
}

# 添加用户确认重启的步骤
$confirmation = Read-Host "更改已应用，是否现在重启计算机？(Y/N)"
if ($confirmation -eq 'Y' -or $confirmation -eq 'y') {
    Restart-Computer -Force # 强制重启计算机
} else {
    Write-Host "重启已取消。请手动重启计算机以使更改生效。"
}
```
---

## 参考资料

* [Microsoft：Azure Powershell](https://learn.microsoft.com/zh-cn/powershell/azure/?view=azps-12.4.0&viewFallbackFrom=azps-9.5.0)
