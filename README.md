# SupplySync Enterprise

Global Supply Chain Intelligence & Fulfillment Engine powered by Next.js and Raw MySQL.

## 🚀 Setup & Execution

Follow these steps to get the environment running and view the optimization dashboard.

### 1. Start the Database
The project uses a Dockerized MySQL 8.0 instance. Run the following command to spin it up:

```bash
pnpm db:up
```

### 2. Prepare the Schema & Data
Once the database is healthy, apply the base schema, migrations, and mock data:

```bash
# Apply initial schema
docker exec -i supplysync-db mysql -uroot -proot supplysync < schema.sql

# Apply advanced feature migrations
docker exec -i supplysync-db mysql -uroot -proot supplysync < alter_schema.sql

# Seed the database with Enterprise mock data
docker exec -i supplysync-db mysql -uroot -proot supplysync < seed.sql
```

### 3. Run the Development Server
Start the Next.js application:

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## 🛠 Features

- **Inventory Replenishment Matrix**: Real-time identification of low-stock items with automated order suggestions using raw SQL joins.
- **Stock-out Prediction**: 30-day demand velocity analysis to predict exactly when stock will run out.
- **Strategic Orders Management**: Global search, status filtering, and multi-entity route tracking.
- **Supplier Performance**: Real-time analytics on delivery times, fulfillment rates, and ratings (★).
- **Logistics Flow Tracking**: Advanced carrier visibility with route-level cost analysis.

## 🗄 Technology Stack

- **Frontend**: Next.js 16.2 (Turbopack), Tailwind CSS 4.
- **Database**: MySQL 8.0 (Docker).
- **Data Access**: `mysql2/promise` with handwritten **Raw SQL** (No ORM).
