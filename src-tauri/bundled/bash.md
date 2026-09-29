---
title: Bash
intro: Common Bash command-line shortcuts and built-in patterns.
tags: [shell, terminal, linux]
categories: [Keyboard Shortcuts]
---

# Bash

## Navigation & History

| Key           | Action                            |
| ------------- | --------------------------------- |
| `Ctrl + R`    | Reverse search command history    |
| `Ctrl + A`    | Move to start of line             |
| `Ctrl + E`    | Move to end of line               |
| `Ctrl + W`    | Delete word before cursor         |
| `Ctrl + K`    | Delete from cursor to end of line |
| `Ctrl + U`    | Delete entire line                |
| `Ctrl + L`    | Clear the screen                  |
| `Up` / `Down` | Browse previous / next history    |

## Common Commands

| Command           | Purpose                          |
| ----------------- | -------------------------------- |
| `ls -la`          | List all files, including hidden |
| `cd ..`           | Move up one directory            |
| `pwd`             | Print working directory          |
| `mkdir -p a/b/c`  | Create nested directories        |
| `cp -r src dest`  | Recursively copy                 |
| `mv old new`      | Move or rename                   |
| `rm -rf dir`      | Recursively force remove         |
| `cat file`        | Print file contents              |
| `head -n 10 file` | First 10 lines                   |
| `tail -f log`     | Follow a log live                |

## Built-in Patterns

### Pipe: feed one command into the next
```bash
cat file | grep error | wc -l
```

### Redirect output- overwrite
```bash
echo "done" > out.txt
```
### Redirect output- append
```bash
echo "done" >> out.txt
```

### Combine conditions
```bash
if [ -f file.txt ] && [ -w file.txt ]; then
  echo "exists and writable"  
fi
```
