---
layout: post
title:  "Powershell组合AzureAD、MSOnline模块导出所有用户信息到文件CSV（MFA、本地同步、状态、联系人信息、用户所在组等）"
date:   2024-08-02 14:06:05
categories: SCIM
tags: Powershell SCIM Scripts Azure EntraID
excerpt: Powershell 脚本攥写记录
---

* content
{:toc}

## UsersProfiles for AzureAD

Powershell组合AzureAD、MSOnline模块导出所有用户信息到文件CSV（MFA、本地同步、状态、联系人信息、用户所在组等） 

---


### 先决条件

1、首先管理员打开Powershell 安装AzureAD模块、MSOnline模块,若有提示输入Y。
```js
Install-Module MSOnline -Force
Install-Module AzureAD -Force
Set-ExecutionPolicy RemoteSigned
```

2、管理员身份运行Powershell ISE，并运行以下示例脚本。


---

### 脚本示例


```js
# Import the Azure AD PowerShell module
Import-Module -Name MSOnline -Force
Import-Module -Name AzureAD -Force

# Connect to Azure AD
Connect-MsolService -AzureEnvironment AzureChinaCloud
Connect-AzureAD -AzureEnvironmentName AzureChinaCloud

# Hide error messages
$ErrorActionPreference = 'SilentlyContinue'

# Get all users and sort them by display name
$AllUsers = Get-MsolUser -All:$True | Sort-Object DisplayName

# Define methods mapping
$Methods = @{
  "OneWaySMS" = "SMS token"
  "TwoWayVoiceMobile" = "Phone call verification" 
  "PhoneAppOTP" = "Hardware token or authenticator app" 
  "PhoneAppNotification" = "Authenticator app" 
}

# Collect the results in an array
$AllUserData = @()

# Get a list of synchronized users' UserPrincipalNames
$UserSynchronized = (Get-MsolUser -Synchronized).UserPrincipalName

# Loop through each user and get their MFA status, group memberships, and contact information
foreach ($MsolUser in $AllUsers) {
  
  try {
      # Get the user's object ID
      $ObjectId = (Get-AzureADUser -ObjectId $MsolUser.UserPrincipalName).ObjectId
      
      # Get group membership and display names, ignoring any errors
      $GroupNames = @()
      Get-AzureADUserMembership -ObjectId $ObjectId | ForEach-Object {
          try {
              $GroupName = (Get-AzureADGroup -ObjectId $_.ObjectId).DisplayName
              $GroupNames += $GroupName
          }
          catch {
              # Do nothing, ignore the error
          }
      }
      
      # Get the user's detailed contact information
      $userDetails = Get-AzureADUser -ObjectId $MsolUser.UserPrincipalName
      $MobilePhone = $userDetails.Mobile
      $EmailAddress = $userDetails.Mail
      $WorkPhone = $userDetails.TelephoneNumber

      # Create the custom object with the additional GroupMemberships and Licenses properties
      $MFAResults = [PSCustomObject]@{
          DisplayName       = $MsolUser.DisplayName
          UserPrincipalName = $MsolUser.UserPrincipalName
          ifBlock           = if($MsolUser.BlockCredential){"Blocked"}else{""}
          MFAStatus         = if($MsolUser.StrongAuthenticationRequirements) {$MsolUser.StrongAuthenticationRequirements.State } else {"Disabled"}
          DefaultMFAMethod  = ($MsolUser.StrongAuthenticationMethods | ? {$_.IsDefault -eq $true}).MethodType
          MFAMethods        = if($MsolUser.StrongAuthenticationMethods){($MsolUser.StrongAuthenticationMethods.MethodType | % { $Methods[$_]}) -join ","}else{"No Methods"}
          Department        = $MsolUser.Department
          Title             = $MsolUser.Title
          GroupMemberships  = $GroupNames -join ', '
          Synchronized      = if($UserSynchronized -contains $MsolUser.UserPrincipalName){"YES"}else{""}
          MobilePhone       = $MobilePhone
          EmailAddress      = $EmailAddress
          WorkPhone         = $WorkPhone
        }
      
  }
  catch {
      $MFAResults = [PSCustomObject]@{
         DisplayName      = " - Not found"
         DefaultMFAMethod = $null
         MFAStatus           = $null
         MFAMethods       = $null
         GroupMemberships = $null
         Department       = $null
         Title                     = $null
         Synchronized     = $null
         MobilePhone      = $null
         EmailAddress     = $null
         WorkPhone        = $null
       }
  }
  
  $AllUserData += $MFAResults
  
}

# Reset the error preference to default
$ErrorActionPreference = 'Continue'

# Export the collected data to a CSV file
$AllUserData  | Export-Csv "$Home\Downloads\UserProfileReport.csv" -NoTypeInformation
exit
```


---

## 参考资料

* [Microsoft：Powershell](https://learn.microsoft.com/zh-cn/powershell/azure/?view=azps-12.4.0&viewFallbackFrom=azps-9.5.0)