-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "churchName" TEXT NOT NULL DEFAULT 'Grace of God Mission Asaba',
    "phone" TEXT NOT NULL DEFAULT '+234 803 000 0000',
    "email" TEXT NOT NULL DEFAULT 'info@ggmasaba.org',
    "address" TEXT NOT NULL DEFAULT 'No. 33 Arthur Richard Street, Akwuebulu (Cable Point), Asaba, Delta State',
    "whatsapp" TEXT NOT NULL DEFAULT '+2348030000000',
    "bankName" TEXT NOT NULL DEFAULT 'Zenith Bank',
    "accountName" TEXT NOT NULL DEFAULT 'Grace of God Mission Asaba',
    "accountNumber" TEXT NOT NULL DEFAULT '1010101010',
    "googleMapsUrl" TEXT,
    "facebookUrl" TEXT,
    "youtubeUrl" TEXT,
    "instagramUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);
