FROM ubuntu:22.04

# https://github.com/vladimirgamalyan/fontbm
RUN apt update -y && apt install -y libfreetype6
ADD fontbm /usr/bin
RUN chmod +x /usr/bin/fontbm
ADD chars.file /tmp/chars.file

ENTRYPOINT ["/usr/bin/fontbm"]
