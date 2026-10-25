
FROM node:22-bookworm

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Install Python dependencies explicitly
RUN python3 -m pip install --break-system-packages --no-cache-dir --upgrade pip \
    && python3 -m pip install --break-system-packages --no-cache-dir -r requirements.txt \
    && python3 -m pip install --break-system-packages --no-cache-dir PyMuPDF

# Verify that the exact Python runtime can import PyMuPDF
RUN python3 -c "import pymupdf; print('PyMuPDF installed successfully')"

EXPOSE 10000

CMD ["npm", "start"]

