npm install -- install node packages



create a db eg pwatest in pgadmin



psql -U <your-db-username> -d pwatest -f tempdbsetup.sql



add .env in your backend folder with DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<databasename>
