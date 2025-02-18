#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/stat.h>
#include <errno.h>
#include <time.h>

#define PORT 8080
#define BUFFER_SIZE 4096
#define LOG_FILE "server.log"

// Function to log messages
void log_message(const char* message, int error) {
    FILE* log_fp = fopen(LOG_FILE, "a");
    if (log_fp == NULL) {
        perror("Error opening log file");
        return;
    }

    time_t now = time(NULL);
    char* time_str = ctime(&now);
    time_str[strlen(time_str) - 1] = '\0'; // Remove newline

    if (error) {
        fprintf(log_fp, "[%s] ERROR: %s - %s\n", time_str, message, strerror(errno));
    } else {
        fprintf(log_fp, "[%s] INFO: %s\n", time_str, message);
    }

    fclose(log_fp);
}

// Return a content type based on the file extension.
const char* get_content_type(const char* path) {
    const char *ext = strrchr(path, '.');
    if (!ext) return "text/plain";
    if (strcmp(ext, ".html") == 0)
        return "text/html";
    else if (strcmp(ext, ".css") == 0)
        return "text/css";
    else if (strcmp(ext, ".js") == 0)
        return "application/javascript";
    // Add more types as needed.
    return "text/plain";
}

// Handles a client connection.
void handle_client(int client_fd) {
    char buffer[BUFFER_SIZE];
    memset(buffer, 0, BUFFER_SIZE);

    // Read the HTTP request.
    int received = recv(client_fd, buffer, BUFFER_SIZE - 1, 0);
    if (received < 0) {
        log_message("recv failed", 1);
        close(client_fd);
        return;
    }

    // Very basic parsing (only supports GET)
    char method[16], url[256], protocol[16];
    if (sscanf(buffer, "%15s %255s %15s", method, url, protocol) != 3) {
        log_message("Failed to parse HTTP request", 1);
        close(client_fd);
        return;
    }

    char log_buf[512];
    snprintf(log_buf, sizeof(log_buf), "Received request: %s %s %s", method, url, protocol);
    log_message(log_buf, 0);

    if (strcmp(method, "GET") != 0) {
        // Only GET is supported.
        char response[] = "HTTP/1.1 501 Not Implemented\r\nContent-Length: 0\r\n\r\n";
        send(client_fd, response, sizeof(response) - 1, 0);
        log_message("Unsupported method", 0);
        close(client_fd);
        return;
    }

    // Prevent directory traversal.
    if (strstr(url, "..")) {
        char response[] = "HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\n\r\n";
        send(client_fd, response, sizeof(response) - 1, 0);
        log_message("Directory traversal attempt blocked", 0);
        close(client_fd);
        return;
    }

    // If the URL is "/" then serve index.html.
    if (strcmp(url, "/") == 0) {
        strcpy(url, "/index.html");
    }

    // Construct the file path. (Assumes assets folder is in the same directory as the server.)
    char path[512];
    snprintf(path, sizeof(path), "./assets%s", url);

    // Open the file.
    FILE *fp = fopen(path, "rb");
    if (!fp) {
        // File not found.
        char response[] = "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n";
        send(client_fd, response, sizeof(response) - 1, 0);
        snprintf(log_buf, sizeof(log_buf), "File not found: %s", path);
        log_message(log_buf, 0);
        close(client_fd);
        return;
    }

    // Determine file size.
    fseek(fp, 0, SEEK_END);
    long file_size = ftell(fp);
    fseek(fp, 0, SEEK_SET);

    // Build and send the response header.
    const char *content_type = get_content_type(path);
    char header[256];
    int header_length = snprintf(header, sizeof(header),
        "HTTP/1.1 200 OK\r\n"
        "Content-Length: %ld\r\n"
        "Content-Type: %s\r\n"
        "\r\n",
        file_size, content_type);
    
    if (send(client_fd, header, header_length, 0) < 0) {
        log_message("Failed to send response header", 1);
        fclose(fp);
        close(client_fd);
        return;
    }

    // Send the file content in chunks.
    size_t n;
    while ((n = fread(buffer, 1, BUFFER_SIZE, fp)) > 0) {
        if (send(client_fd, buffer, n, 0) < 0) {
            log_message("Failed to send file content", 1);
            break;
        }
    }

    if (ferror(fp)) {
        log_message("Error reading file", 1);
    }

    fclose(fp);
    close(client_fd);
    snprintf(log_buf, sizeof(log_buf), "Successfully served file: %s", path);
    log_message(log_buf, 0);
}

int main() {
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        log_message("socket failed", 1);
        exit(EXIT_FAILURE);
    }

    // Allow reuse of the address.
    int opt = 1;
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        log_message("setsockopt failed", 1);
        exit(EXIT_FAILURE);
    }

    struct sockaddr_in address;
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY; // Listen on all interfaces.
    address.sin_port = htons(PORT);

    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        log_message("bind failed", 1);
        exit(EXIT_FAILURE);
    }

    if (listen(server_fd, 10) < 0) {
        log_message("listen failed", 1);
        exit(EXIT_FAILURE);
    }

    char log_buf[64];
    snprintf(log_buf, sizeof(log_buf), "Server listening on port %d", PORT);
    log_message(log_buf, 0);
    printf("%s\n", log_buf);

    // Main loop to accept and handle incoming connections.
    while (1) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        int client_fd = accept(server_fd, (struct sockaddr *)&client_addr, &client_len);
        if (client_fd < 0) {
            log_message("accept failed", 1);
            continue;
        }
        // For simplicity, we're handling one client at a time.
        handle_client(client_fd);
    }

    close(server_fd);
    return 0;
}
