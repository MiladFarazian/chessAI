FROM amazonlinux:2
RUN yum -y update && \
    yum -y install gcc gcc-c++ make wget unzip
WORKDIR /app
COPY . .
RUN wget https://stockfishchess.org/files/stockfish-<version>-src.zip && \
    unzip stockfish-<version>-src.zip && \
    cd stockfish-<version>-src && \
    make build ARCH=x86-64 && \
    mv stockfish ../stockfish/stockfish
CMD ["python3", "app.py"]
