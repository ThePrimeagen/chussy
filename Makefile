# Makefile for building the C HTTP server

CC      = gcc
CFLAGS  = -Wall -Wextra -O2
TARGET  = main
SRC     = server/main.c

.PHONY: all clean run

all: $(TARGET)

$(TARGET): $(SRC)
	$(CC) $(CFLAGS) -o $(TARGET) $(SRC)

clean:
	rm -f $(TARGET)

run: $(TARGET)
	./$(TARGET)

