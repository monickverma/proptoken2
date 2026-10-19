FROM golang:1.25-alpine

WORKDIR /app

COPY go.mod ./
# COPY go.sum ./ # Uncomment if go.sum exists

# RUN go mod download # Uncomment if dependencies exist

COPY . .

RUN go build -o oracle-node main.go

EXPOSE 8081

CMD ["./oracle-node"]
