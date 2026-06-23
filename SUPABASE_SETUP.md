# Supabase Setup Guide

## Environment Variables Updated ✓
Your `.env` file has been updated with your Supabase credentials:
- **Project URL**: https://fulplkmehjeavaojaftn.supabase.co
- **Publishable Key**: sb_publishable_K7bCGeVygv5tjR9oH3e2Rg_tWWGwRSc

## Required Database Tables

Log in to your Supabase Dashboard (https://app.supabase.com) and create the following tables:

### 1. Feedback Table

```sql
CREATE TABLE feedback (
  id BIGSERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  submittedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX idx_feedback_submittedAt ON feedback(submittedAt DESC);
```

### 2. Products Table

```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for name searches
CREATE INDEX idx_products_name ON products(name);
```

## Steps to Create Tables in Supabase

1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Create a new query
5. Copy and paste the SQL code above
6. Click **Run**

## Enable Realtime Updates (Optional)

For real-time updates to feedbacks and products, you can enable Realtime in the Supabase dashboard:

1. Go to **Replication** settings
2. Enable Realtime for `feedback` and `products` tables

## API Endpoints Updated ✓

The following controllers have been updated to use Supabase:

### Feedback Endpoints
- **GET** `/api/feedback` - Get all feedbacks
- **POST** `/api/feedback` - Create new feedback

### Products Endpoints
- **GET** `/api/products` - Get all products
- **POST** `/api/products` - Create new product
- **PUT** `/api/products/:id` - Update product
- **DELETE** `/api/products/:id` - Delete product

## Testing the Connection

Start your server and test with these curl commands:

```bash
# Get feedbacks
curl http://localhost:3000/api/feedback

# Create feedback
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"message":"Great product!"}'

# Get products
curl http://localhost:3000/api/products

# Create product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":29.99}'
```

## File Storage (Optional)

To enable file uploads in Supabase:

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket named `public-uploads`
3. Set it to public access
4. You can then upload files using the Supabase SDK

Example storage code:
```javascript
const { data, error } = await supabase.storage
  .from('public-uploads')
  .upload(`feedbacks/feedback-${Date.now()}.txt`, file);
```

## Troubleshooting

- **"Table does not exist" error**: Make sure you've created the tables using the SQL provided above
- **"Permission denied" error**: Check that your API key has the correct permissions
- **CORS errors**: Enable CORS in Supabase project settings if accessing from different domain
