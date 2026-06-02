CREATE TABLE "entries" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"entry_key" text NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "entries_user_type_key" ON "entries" ("user_id","type","entry_key");