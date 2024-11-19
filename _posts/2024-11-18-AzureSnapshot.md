---
layout: post
title:  "定期创建快照并自动删除旧快照的PowerShell脚本"
date:   2024-11-18 20:33:00
categories: Powershell
tags: Powershell Azure Scripts Snapshot 
excerpt: 本文介绍了一个用于定期创建Azure磁盘快照，并自动删除超过30天快照的PowerShell脚本。
---

* content
{:toc}

## 问题背景

代理频繁出现问题，和节省费用，需要手动批量创建快照
---
## 方案脚本示例
---
### 登录Azure账户, 1.本地使用
```
Connect-AzAccount -EnvironmentName AzureChinaCloud
Select-AzSubscription -SubscriptionId "your-subscription-id"
```
---
### 登录Azure账户, 2.自动化帐户调用保存的凭据使用
```
$Cred = Get-AutomationPSCredential -Name "nanru1"
Connect-AzAccount -Credential $Cred -EnvironmentName AzureChinaCloud
Select-AzSubscription -SubscriptionId "your-subscription-id"
```
---
### 登录Azure账户，3.自动化帐户调用托管标识使用
```
Connect-AzAccount -EnvironmentName azurechinacloud -Identity
Select-AzSubscription -SubscriptionId "your-subscription-id"
```
---
### 定义参数和脚本主体
```
# 获取当前日期并格式化为yyyy-MM-dd格式
$currentDate = Get-Date
$formattedDate = $currentDate.ToString("yyyy-MM-dd")

# 定义订阅ID和位置
$subscriptionId = "your-subscription-id"  # 请替换为你的订阅ID
$Location = "chinaeast"                   # 请替换为你的位置

# 定义一个包含多个磁盘名称及其对应资源组的表
$DiskNamesAndResourceGroups = @(
    @{ DiskName = "XXXXX"; ResourceGroup = "XXXXX" },
    @{ DiskName = "XXXXX"; ResourceGroup = "XXXXX" },
    @{ DiskName = "XXXXX"; ResourceGroup = "XXXXX" }
)

# 初始化结果列表
$results = @()

# 循环遍历每个磁盘名称及其对应的资源组
foreach ($item in $DiskNamesAndResourceGroups) {
    $DiskName = $item.DiskName
    $resourceGroup = $item.ResourceGroup

    # 为每个磁盘定义快照名称
    $SnapshotName = "Snapshot-$DiskName-$formattedDate"

    # 创建快照配置，使用HDD本地冗余类型（LRS）
    $snapshotConfig = New-AzSnapshotConfig -Location $Location -SourceUri "/subscriptions/$subscriptionId/resourceGroups/$resourceGroup/providers/Microsoft.Compute/disks/$DiskName" -CreateOption Copy -SkuName Standard_LRS

    # 检查快照是否已存在
    $existingSnapshot = Get-AzSnapshot -ResourceGroupName $resourceGroup -SnapshotName $SnapshotName -ErrorAction SilentlyContinue

    if ($existingSnapshot) {
        # 更新现有快照
        Update-AzSnapshot -Snapshot $snapshotConfig -ResourceGroupName $resourceGroup -SnapshotName $SnapshotName

        # 添加更新结果到结果列表
        $results += [PSCustomObject]@{
            Action = "Updated"
            SnapshotName = $SnapshotName
            ResourceGroup = $resourceGroup
            Location = $Location
            SourceDisk = $DiskName
            Status = "Success"
        }
    } else {
        # 创建快照
        $snapshot = New-AzSnapshot -Snapshot $snapshotConfig -ResourceGroupName $resourceGroup -SnapshotName $SnapshotName

        # 添加创建结果到结果列表
        $results += [PSCustomObject]@{
            Action = "创建"
            SnapshotName = $SnapshotName
            ResourceGroup = $resourceGroup
            Location = $Location
            SourceDisk = $DiskName
            Status = "创建成功"
        }
    }
}

# 删除30天前创建的快照
$daysToKeep = 30
$cutoffDate = (Get-Date).AddDays(-$daysToKeep)

# 获取所有快照
$snapshots = Get-AzSnapshot -ResourceGroupName * | Where-Object { $_.Name -match "^Snapshot-.*-\d{4}-\d{2}-\d{2}$" }

# 遍历每个快照，检查其名称中的日期是否超过30天
foreach ($snapshot in $snapshots) {
    $snapshotName = $snapshot.Name
    $resourceGroup = $snapshot.ResourceGroupName

    # 提取快照名称中的日期部分
    if ($snapshotName -match "Snapshot-.*-(\d{4}-\d{2}-\d{2})") {
        $snapshotDateStr = $matches[1]
        $snapshotDate = [DateTime]::ParseExact($snapshotDateStr, "yyyy-MM-dd", $null)

        # 检查快照日期是否超过30天
        if ($snapshotDate -lt $cutoffDate) {
            # 删除快照
            Remove-AzSnapshot -ResourceGroupName $resourceGroup -SnapshotName $snapshotName -Force

            # 添加删除结果到结果列表
            $results += [PSCustomObject]@{
                Action = "删除"
                SnapshotName = $snapshotName
                ResourceGroup = $resourceGroup
                Location = $Location
                Status = "删除成功"
            }
        } else {
            # 添加未删除结果到结果列表
            $results += [PSCustomObject]@{
                Action = "Skipped"
                SnapshotName = $snapshotName
                ResourceGroup = $resourceGroup
                Location = $Location
                Status = "小于30天跳过删除"
            }
        }
    } else {
        # 添加未匹配结果到结果列表
        $results += [PSCustomObject]@{
            Action = "跳过"
            SnapshotName = $snapshotName
            ResourceGroup = $resourceGroup
            Location = $Location
            Status = "快照命名格式不匹配跳过操作"
        }
    }
}

# 输出结果表格
Write-Output $results | Format-Table -Property Action, SnapshotName, ResourceGroup, Location, Status

Write-Output "定期创建快照，删除30天前快照操作已完成."

```
---

## 参考资料

* [Microsoft：Azure Powershell](https://learn.microsoft.com/zh-cn/powershell/azure/?view=azps-12.4.0&viewFallbackFrom=azps-9.5.0)
