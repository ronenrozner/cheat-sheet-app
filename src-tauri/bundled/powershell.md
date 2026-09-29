---
title: PowerShell
intro: Everyday PowerShell cmdlet and pipeline shortcuts.
tags: [shell, windows, scripting]
categories: [Keyboard Shortcuts]
---

# PowerShell

## Console Shortcuts

| Key            | Action                              |
| -------------- | ----------------------------------- |
| `F2`           | Toggle breakpoint in the editor     |
| `F4`           | Move current line to top or bottom  |
| `Alt + Enter`  | Open the selected item's Properties |
| `Ctrl + Space` | Trigger member completion           |
| `F7`           | Open command history menu           |
| `Ctrl + D`     | Delete the current word             |

## Common Cmdlets

| Cmdlet                   | Purpose                 |
| ------------------------ | ----------------------- |
| `Get-Command`            | List available commands |
| `Get-Process`            | List running processes  |
| `Get-Service`            | List services           |
| `Stop-Process -Name foo` | Stop a process          |
| `Get-Content file.txt`   | Read a file             |
| `Set-Content file.txt`   | Write a file            |
| `Test-Path foo`          | Check an item exists    |
| `New-Item foo`           | Create an item          |
| `Get-ChildItem`          | List directory contents |

## Pipelines

### Filter and format
```powershell
Get-Process | Where-Object CPU -gt 100 | Sort-Object WorkingSet -Descending
```
### Select properties
```powershell
Get-Service | Select-Object Name, Status, StartType
```

### Count and output
```powershell
Get-ChildItem -Recurse | Where-Object { $_.Extension -eq '.log' } | Measure-Object
```

## Registry

### Read a registry value
```powershell
Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* |
  Select-Object DisplayName, DisplayVersion
```
