-- DropIndex
DROP INDEX "public"."post_post_number_idx";

-- DropIndex
DROP INDEX "public"."post_title_idx";

-- CreateTable
CREATE TABLE "public"."post_tag" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_tag_relation" (
    "post_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "post_tag_relation_pkey" PRIMARY KEY ("post_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_tag_name_key" ON "public"."post_tag"("name");

-- CreateIndex
CREATE INDEX "post_tag_name_idx" ON "public"."post_tag"("name");

-- CreateIndex
CREATE INDEX "post_tag_created_at_idx" ON "public"."post_tag"("created_at");

-- CreateIndex
CREATE INDEX "post_tag_relation_tag_id_idx" ON "public"."post_tag_relation"("tag_id");

-- CreateIndex
CREATE INDEX "post_tag_relation_post_id_idx" ON "public"."post_tag_relation"("post_id");

-- CreateIndex
CREATE INDEX "post_created_at_idx" ON "public"."post"("created_at");

-- AddForeignKey
ALTER TABLE "public"."post_tag_relation" ADD CONSTRAINT "post_tag_relation_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_tag_relation" ADD CONSTRAINT "post_tag_relation_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."post_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
