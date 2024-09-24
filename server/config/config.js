module.exports = {
  port: 5000,
  dbURL: 'mongodb://127.0.0.1:27017/ytbuploader',
  dbOptions: { useUnifiedTopology: true, useNewUrlParser: true },
  // rootDir: '/Users/viktorkusnir/apps/uploaderV3/client/public',
  // autoUploadDir: '/Users/viktorkusnir/apps/uploaderV3/client/public/uploads/auto',
  rootDir: '/var/www/uploader/www/client/public',
  autoUploadDir: '/var/www/uploader/www/client/public/uploads/auto',
  secret: 'zzz',
  credentials: {
    "client_id": "567094205545-j5ed0fqndfju3jnknb7ttn7q11vn5t7f.apps.googleusercontent.com",
    "project_id": "youtube-uploader-262706",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "OQGnC5SQtfAoza2ypoxQfDWD",
    "redirect_uris": ["http://localhost:4000/callback"],
    "javascript_origins": ["http://localhost", "http://localhost:4000"]
  },
  kxDescription: "Archiving and preserving rare records and other sought-after sounds through crowdfunding before they vanish. Created and being run by music enthusiasts, the KollektivX music community aims to preserve and revitalize less known music that wasn't issued digitally.\n\nStart your own projects at https://bit.ly/kollektivx",
  tags: [
    "vinyl",
    "vinyl records",
    "rare records",
    "rare music",
    "african music",
    "afro funk",
    "afro music",
    "jazz",
    "rare jazz",
    "rare grooves",
    "rare disco",
    "rare African music",
    "rare soul",
    "soul music",
    "rare electronic music",
    "rare house music",
    "house music",
    "electronic music",
    "record collector",
    "audiophile",
    "audiophile music",
    "rare funk",
    "funk music",
    "70s music",
    "80s music",
    "KollektivX",
    "Kollektiv x",
    "kollektivx rare records",
    "kollektivx rare music",
    "rare vinyl records",
    "unknown music",
  ]
}