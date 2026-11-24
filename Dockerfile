FROM mcr.microsoft.com/playwright:v1.49.1-jammy

WORKDIR /app

ENV CI=true
ENV NODE_ENV=test
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV HUSKY=0

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run validate

RUN mkdir -p /app/test-results /app/playwright-report /app/allure-results

CMD ["npx", "playwright", "test"]
