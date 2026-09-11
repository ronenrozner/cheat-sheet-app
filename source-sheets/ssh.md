---
title: SSH
intro: This quick reference cheat sheet provides various for using SSH.
tags:
  - protocol
  - remote
  - network
  - 22
---

## Getting Started

### Connecting

Connect to a server (default port 22)

```shell script
$ ssh root@192.168.1.5
```

Connect on a specific port

```shell script
$ ssh root@192.168.1.5 -p 6222
```

Connect via pem file (0400 permissions)

```shell script
$ ssh -i /path/file.pem root@192.168.1.5
```

See: [SSH Permissions](/chmod#ssh-permissions)

### Executing

Executes remote command

```shell script
$ ssh root@192.168.1.5 'ls -l'
```

Invoke a local script

```shell script
$ ssh root@192.168.1.5 bash < script.sh
```

Compresses and downloads from a server

```shell script
$ ssh root@192.168.1.5 "tar cvzf - ~/source" > output.tgz
```

### SCP

Copies from remote to local

```shell script
$ scp user@server:/dir/file.ext dest/
```

Copies between two servers

```shell script
$ scp user@server:/file user@server:/dir
```

Copies from local to remote

```shell script
$ scp dest/file.ext user@server:/dir
```

Copies a whole folder

```shell script
$ scp -r user@server:/dir dest/
```

Copies all files from a folder

```shell script
$ scp user@server:/dir/* dest/
```

Copies from a server folder to the current folder

```shell script
$ scp user@server:/dir/* .
```

### Config location

| File Path                | Description          |
| ------------------------ | -------------------- |
| `/etc/ssh/ssh_config`    | System-wide config   |
| `~/.ssh/config`          | User-specific config |
| `~/.ssh/id_{type}`       | Private key          |
| `~/.ssh/id_{type}.pub`   | Public key           |
| `~/.ssh/known_hosts`     | Known Servers        |
| `~/.ssh/authorized_keys` | Authorized login key |

### SCP Options

| Options       | Description                                    |
| ------------- | ---------------------------------------------- |
| scp `-r`      | Recursively copy entire directories |
| scp `-C`      | Compresses data                     |
| scp `-v`      | Prints verbose info                 |
| scp `-P` 8080 | Uses a specific Port                |
| scp `-B`      | Batch mode _(Prevents password)_    |
| scp `-p`      | Preserves times and modes           |

### Config sample

```toml
Host server1
    HostName 192.168.1.5
    User root
    Port 22
    IdentityFile ~/.ssh/server1.key
```

Launch by alias

```shell script
$ ssh server1
```

See: Full [Config Options](https://linux.die.net/man/5/ssh_config)

### ProxyJump

```shell script
$ ssh -J proxy_host1 remote_host2
```

```shell script
$ ssh -J user@proxy_host1 user@remote_host2
```

Multiple jumps

```shell script
$ ssh -J user@proxy_host1:port1,user@proxy_host2:port2 user@remote_host3
```

### ssh-copy-id

```shell script
$ ssh-copy-id user@server
```

Copy to alias server

```shell script
$ ssh-copy-id server1
```

Copy specific key

```shell script
$ ssh-copy-id -i ~/.ssh/id_rsa.pub user@server
```

## SSH keygen

### ssh-keygen

```shell script
$ ssh-keygen -t rsa -b 4096 -C "your@mail.com"
```

---

| -   | -    | -                             |
| --- | ---- | ----------------------------- |
|     | `-t` | [Type](#key-type) of key      |
|     | `-b` | The number of bits in the key |
|     | `-C` | Provides a new comment        |


Generate an RSA 4096 bit key with email as a comment, or use [SSH Key Generator](https://sshkeygenerator.com/) online

### Generate

Generate a key interactively

```shell script
$ ssh-keygen
```

Specify filename

```shell script
$ ssh-keygen -f ~/.ssh/filename
```

Generate public key from private key

```shell script
$ ssh-keygen -y -f private.key > public.pub
```

Change comment

```shell script
$ ssh-keygen -c -f ~/.ssh/id_rsa
```

Change private key passphrase

```shell script
$ ssh-keygen -p -f ~/.ssh/id_rsa
```

### Key type

- rsa
- ed25519
- dsa
- ecdsa

### known_hosts

Search from known_hosts

```shell script
$ ssh-keygen -F <ip/hostname>
```

Remove from known_hosts

```shell script
$ ssh-keygen -R <ip/hostname>
```

### Key format

- PEM
- PKCS8

## SSH Tunneling

### SSH Tunnel Options

| Option | Description                                            |
| ------ | :----------------------------------------------------- |
| `-L`   | Local port forwarding                                  |
| `-R`   | Remote port forwarding                                 |
| `-D`   | Dynamic port forwarding                                |
| `-f`   | Run in background                                      |
| `-N`   | Do not execute a remote command                        |
| `-g`   | Allow remote hosts to connect to local forwarded ports |


more details on flag above with `man ssh`

### Local Port Forwarding

```bash
# Forward a local port to a remote server
ssh -L local_port:remote_host:remote_port user@ssh_server

# Example: Forward local port 8080 to remote port 80 on example.com
ssh -L 8080:example.com:80 user@ssh_server
```

### Dynamic Port Forwarding

```bash
# Create a SOCKS proxy on a local port
ssh -D local_port user@ssh_server

# Create a SOCKS proxy on local port 1080 in the background
ssh -f -N -D 1080 user@ssh_server
```

### Background Tunnel

```bash
# Create a local port forwarding tunnel in the background
ssh -f -N -L local_port:remote_host:remote_port user@ssh_server
```

### Multiple Tunnels

```bash
# Create multiple tunnels in a single SSH command
ssh -L 8080:example.com:80 -L 3306:db.example.com:3306 user@ssh_server
```

### Combining Options

```bash
# In background, no command, allow remote host, local port forward, identity_file
ssh -f -N -g -L 8080:example.com:80 -i ~/.ssh/custom_key user@ssh_server
```

## Also see

- [OpenSSH Config File Examples](https://www.cyberciti.biz/faq/create-ssh-config-file-on-linux-unix/) _(cyberciti.biz)_
- [ssh_config](https://linux.die.net/man/5/ssh_config) _(linux.die.net)_
- [man-ssh](https://man7.org/linux/man-pages/man1/ssh.1.html)
