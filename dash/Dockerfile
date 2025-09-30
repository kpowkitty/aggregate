FROM --platform=linux/amd64 archlinux:base-devel

SHELL ["/bin/bash", "-c"]

# this comes from LXC, where this breaks pacman.may not be needed
RUN sed -i 's/#DisableSandbox/DisableSandbox/g' /etc/pacman.conf

# update system
RUN pacman -Syu --noconfirm

#don't need base-devel, because we're using base-devel image
RUN pacman -S --noconfirm       \
        sudo    \
        openssh \
        git     \
        vim             \
        curl    \
        wget    \
        nodejs  \
        npm             \
        mysql   \
        mariadb

# make home and add to wheel group
RUN useradd -m aggregate &&     \
        usermod -aG wheel aggregate &&  \
        tee -a /etc/sudoers <<< 'aggregate ALL=(ALL) NOPASSWD: ALL' &&  \
        ln -s /bin/vim /bin/vi

# CREDIT: https://github.com/sickcodes/Docker-OSX/blob/master/Dockerfile
# Fixes issue with invalid GPG keys: update the archlinux-keyring package to get
# the latest keys, then remove and regenerate gnupg keys
RUN pacman -Sy archlinux-keyring --noconfirm && \
        rm -rf /etc/pacman.d/gnupg &&   \
        pacman-key --init &&    \
        pacman-key --populate archlinux

USER root
RUN mkdir -p /var/lib/mysql &&  \
        chown -R mysql:mysql /var/lib/mysql &&  \
        mysql_install_db --user=mysql --basedir=/usr --datadir=/var/lib/mysql

EXPOSE 3306 8081

CMD ["/bin/bash", "-c", "/usr/bin/mariadbd-safe --datadir=/var/lib/mysql && exec bash"]
