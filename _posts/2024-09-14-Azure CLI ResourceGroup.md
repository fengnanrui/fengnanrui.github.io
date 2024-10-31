---
layout: post
title:  "导出资源组、登录账户、角色和授权范围到CSV的脚本"
date:   2024-09-14 14:06:05
categories: Azure
tags: Powershell Azure Scripts EntraID
excerpt: 导出资源组、登录账户、角色和授权范围到CSV的Powershell脚本
---

* content
{:toc}

## 问题描述

源自客户查看大量资源组、授权的需求，我这边撰写了一个脚本，可以将资源组、登录账户、角色、和授权范围，输出成CSV。供大家参考，如下：

## 步骤 1

请打开 PowerShell ISE 新建空白脚本并提前设置路径到 D 盘，方便导出查看文件，并登录。如果有多个订阅，请提前设置订阅：

```powershell
az cloud set -n AzureChinaCloud # 切换到中国Azure
az login # 登录
az account set --subscription <SubscriptionId> # 切换订阅
```

## 步骤 2

```
# 设置输出 CSV 文件名
$OutputCSV = "role_assignments.csv"

# 创建 CSV 文件并添加表头
@"
ResourceGroup,PrincipalName,PrincipalType,Role,Scope
"@ | Out-File -FilePath $OutputCSV -Encoding utf8

# 获取订阅下的所有资源组
$ResourceGroups = az group list --output json | ConvertFrom-Json

# 对每个资源组执行循环
foreach ($Group in $ResourceGroups.Name) {
    # 获取该资源组的所有角色分配（包括继承）
    $RoleAssignments = az role assignment list --include-inherited --resource-group $Group --output json | ConvertFrom-Json

    # 将分配信息追加到 CSV 文件中
    foreach ($Assignment in $RoleAssignments) {
        Add-Content -Path $OutputCSV -Value @"
$($Group),$($Assignment.principalName),$($Assignment.principalType),$($Assignment.roleDefinitionName),$($Assignment.scope)
"@
    }
}

Write-Host "CSV file '$OutputCSV' has been created with the role assignments."
```

