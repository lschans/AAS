yum -y install mod_ssl openssl

# Generate private key 
openssl genrsa -out server.key 2048 

# Generate CSR 
openssl req -new -key server.key -out server.csr

# Generate Self Signed Key
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

