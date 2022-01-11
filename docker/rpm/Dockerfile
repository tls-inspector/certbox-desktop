FROM fedora:latest

RUN dnf install -y rpm-build wget xz tar jq

WORKDIR /tmp

ADD install_node.sh /
RUN chmod +x /install_node.sh && /bin/sh /install_node.sh

VOLUME [ "/build_root" ]
ADD "entrypoint.sh" /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT /entrypoint.sh