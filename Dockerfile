FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
# Pin serve and put it on PATH
RUN npm install -g serve@14.2.4 && which serve && serve --version
COPY --from=build /app/dist ./dist
# Verify static assets exist in image
RUN ls -la dist && test -f dist/index.html
ENV PORT=8080
EXPOSE 8080
# Simple listen form — serve defaults to 0.0.0.0
CMD ["sh", "-c", "echo Starting on PORT=${PORT}; exec serve -s dist -l ${PORT} --no-clipboard -n"]
