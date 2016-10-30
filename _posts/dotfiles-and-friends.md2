---
date: 2016-10-03
title: Dotfiles and Friends
tags:
---

It has long been a dream of mine to be able to start with any vanilla install,
and get up and running with *my* favourite tools and settings within minutes.
Ideally after *one setup command*.

As I began deploying this blog, it was time to test the theory. Can I bring up a
new server, and then get:

- all basic programs: `git`, `curl`, etc.
- Vim with `.vimrc` and all plugins installed
- tmux with `.tmuxrc` and all plugins installed
- some `~/bin` goodies (may even be required for tmux status bar)

The first step was to find a dotfiles manager. I read through
[this][awesome-dotfiles] post, and eventually decided on using [yadm][yadm]. I
chose `yadm` because

- it has least dependencies. no Python (2 or 3!?) or Ruby, *just git*
- advertises support for handling configs across OSes, hosts
- easy to use - essentially just a wrapper around git that works from anywhere

I am quite happy with my choice - yadm is working great and was very easy to
become comfortable with. It essentially turns your `$HOME` into a git repo that
you need to add specific files too - and `yadm status` won't show untracked
files.

You can find my dotfiles repo at [github.com/thejmazz/dotfiles][dotfiles].

Next was Node. Nvm was the obvious choice. However one issue with nvm is the
default install script (the one you can `curl | bash`) will add lines to your
`.bashrc` - on my mac it was

```bash
export NVM_DIR="/Users/jmazz/.nvm"
[ -s "$NVM_DIR/nvm.sh"   ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
```

Which makes perfect sense - check if `nvm.sh` is there and source it if it is.
But this was hardcoded to `/Users/jmazz`. I quickly [changed
that][bashrc-nvm-fix] and took another look at the nvm page - I would need to
"manually install".  It's really not that bad - just git clone instead of `curl
| bash` - and now I can maintain my own `.bashrc` without having things chunked
into it.

```bash
export NVM_DIR="$HOME/.nvm" && (
  git clone https://github.com/creationix/nvm.git "$NVM_DIR"
  cd "$NVM_DIR"
  git checkout `git describe --abbrev=0 --tags --match "v[0-9]*" origin`
) && . "$NVM_DIR/nvm.sh"
```

This brings us into system dependencies territory - `git` will need to be
installed beforehand. And where to place this install script?

Moreover - we will need a user and home directory, and will probably want to
take care of other houskeeping measures:

- user login with password+key
- no root login

This is when I realized this post will no longer be just about dotfiles - but
rather - how to set up a server from scratch and get to the point where all
dotfiles+programs are available. For this I will be using Digital Ocean.

1. Set up an Ubuntu 16.04 droplet from online
3. SSH in: `ssh root@$SERVER_IP_ADDRESS -i ~/.ssh/digital-ocean_mazzitelli.julian_rsa`
4. `adduser --disabled-password --gecos "" julian`
2. Copy the IP and run `locksmith.sh`. (make a key and ssh-copy-id it)
5. Modify `/etc/ssh/sshd_config` and reload `sudo systemctl reload sshd`
6. Set up firewall
8. Install yadm; yadm clone (conflicts when `.bashrc` already exists)
7. Clone vundle. `vim +PluginInstall +qall`

For these scripts we will need the following environment variables (on your
local machine):

```bash
export SERVER_IP_ADDRESS=127.0.0.1 # Droplet IP
export USERNAME=user # Droplet username
export SHORTCUT=matrix # SSH config blockname
```

We will need an ssh key later on - so best to set it up now so we can run it
while DO is provisioning our droplet.
Little make a key script (for local machine):

```bash
# Use a good name - I like shortcut_host_user_rsa
export KEY_NAME="$SHORTCUT_$SERVER_IP_ADDRESS_$USERNAME_rsa"
ssh-keygen -f $KEY_NAME
# With a good `~/.ssh/config`, you could `ssh $SHORTCUT`, using this Go program
# Add key to ~/.ssh/authorized_keys on server
ssh-copy-id -i $KEY_NAME $USERNAME@$SERVER_IP_ADDRESS
```

At the very end, after setting up an Ubuntu 16.04 box on Digital Ocean, these
are the commands to find `$HOME` again:

```bash
# Get inside the box
ssh root@$SERVER_IP_ADDRESS
# ....
# Welcome to Ubuntu...
# add a user and give them sudo
adduser $USERNAME && usermod -aG sudo $USERNAME
```


Then we need to modify our ssh daemon config so that login is only allowed with
a key - no sketchy password only logins! (This means you will need your keys if
you want to ssh in from phone/tablet - someone elses computer..).

```bash
vi /etc/ssh/sshd_config
# Uncomment, should have:
# PasswordAuthentication no
```

These settings will not need to be changed, but are required for key-only
authentication:

```bash
PubkeyAuthentication yes
ChallengeResponseAuthentication no
```

And then reload the SSH daemon:

```bash
sudo systemctl reload sshd
```

**Test your login before disconnecting!**

Then we can set up the firewall:

```bash
# sudo ufw app list
sudo ufw allow OpenSSH
sudo ufw enable
# sudo ufw status
```

[awesome-dotfiles]: https://github.com/webpro/awesome-dotfiles
[yadm]: https://thelocehiliosan.github.io/yadm/
[dotfiles]: https://github.com/thejmazz/dotfiles
[bashrc-nvm-fix]: https://github.com/thejmazz/dotfiles/commit/c07847d75b563cede01cdace5bddcdc784f6310f
